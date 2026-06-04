import { AppError, LLMError, NotFoundError } from '../../types/errors.js';
import { createChildLogger } from '../../config/logger.js';
import type { SendMessageInput } from './chat.schema.js';
import type { StreamEvent, MessageDTO, ConversationDTO } from '../../types/index.js';
import type { Conversation, Message, MessageStatus } from '@prisma/client';

const log = createChildLogger('chatService');

export interface ChatServiceConfig {
  maxHistoryMessages: number;
}

export interface ChatRepositoryPort {
  getOrCreateConversation(sessionId?: string): Promise<Conversation>;
  addMessage(
    conversationId: string,
    sender: 'user' | 'ai',
    text: string,
    status?: MessageStatus
  ): Promise<Message>;
  getRecentMessages(conversationId: string, limit: number): Promise<Message[]>;
  getConversationWithMessages(
    conversationId: string
  ): Promise<(Conversation & { messages: Message[] }) | null>;
}

export interface LLMServicePort {
  generateReplyStream(
    history: MessageDTO[],
    userMessage: string,
    signal?: AbortSignal
  ): AsyncGenerator<string>;
}

export class ChatService {
  constructor(
    private readonly repository: ChatRepositoryPort,
    private readonly llmService: LLMServicePort,
    private readonly config: ChatServiceConfig
  ) {}

  async *sendMessage(
    input: SendMessageInput,
    signal?: AbortSignal
  ): AsyncGenerator<StreamEvent> {
    const { message, sessionId } = input;
    let conversation: Conversation | null = null;
    let userMessageSaved = false;

    try {
      signal?.throwIfAborted();
      conversation = await this.repository.getOrCreateConversation(sessionId);

      log.info(
        { conversationId: conversation.id, isNew: !sessionId },
        'Processing message'
      );

      // Fetch previous context before saving the current turn.
      const recentMessages = await this.repository.getRecentMessages(
        conversation.id,
        this.config.maxHistoryMessages
      );

      await this.repository.addMessage(conversation.id, 'user', message);
      userMessageSaved = true;
      signal?.throwIfAborted();

      const historyDTOs = this.toMessageDTOs(recentMessages);
      let fullReply = '';

      for await (const token of this.llmService.generateReplyStream(
        historyDTOs,
        message,
        signal
      )) {
        signal?.throwIfAborted();
        fullReply += token;
        yield { type: 'token', data: token } satisfies StreamEvent;
      }

      if (!fullReply.trim()) {
        throw new LLMError(
          'Our support agent could not generate a response. Please try again.'
        );
      }

      await this.repository.addMessage(conversation.id, 'ai', fullReply);

      yield {
        type: 'done',
        data: { sessionId: conversation.id, reply: fullReply },
      } satisfies StreamEvent;
    } catch (error) {
      if (signal?.aborted) {
        log.info(
          { conversationId: conversation?.id },
          'Chat stream cancelled by client'
        );
        return;
      }

      log.error({ err: error }, 'Error in sendMessage stream');
      const publicError = this.getPublicError(error);

      if (conversation && userMessageSaved) {
        try {
          await this.repository.addMessage(
            conversation.id,
            'ai',
            publicError.message,
            'failed'
          );
        } catch (persistenceError) {
          log.error(
            { err: persistenceError, conversationId: conversation.id },
            'Failed to persist AI error message'
          );
        }
      }

      yield {
        type: 'error',
        data: {
          ...publicError,
          ...(conversation && { sessionId: conversation.id }),
        },
      } satisfies StreamEvent;
    }
  }

  async getHistory(sessionId: string): Promise<ConversationDTO> {
    const conversation =
      await this.repository.getConversationWithMessages(sessionId);

    if (!conversation) {
      throw new NotFoundError(`Conversation ${sessionId} not found`);
    }

    return {
      id: conversation.id,
      channel: conversation.channel,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messages: this.toMessageDTOs(conversation.messages),
    };
  }

  private toMessageDTOs(messages: Message[]): MessageDTO[] {
    return messages.map((message) => ({
      id: message.id,
      conversationId: message.conversationId,
      sender: message.sender as 'user' | 'ai',
      text: message.text,
      status: message.status as 'completed' | 'failed',
      createdAt: message.createdAt.toISOString(),
    }));
  }

  private getPublicError(error: unknown): {
    message: string;
    code: string;
    statusCode: number;
  } {
    if (error instanceof AppError && error.isOperational) {
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      };
    }

    return {
      message:
        'Something went wrong while contacting our support agent. Please try again.',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    };
  }
}
