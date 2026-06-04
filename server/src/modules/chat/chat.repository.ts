import {
  PrismaClient,
  Conversation,
  Message,
  MessageStatus,
} from '@prisma/client';
import { createChildLogger } from '../../config/logger.js';

const log = createChildLogger('chatRepository');

export class ChatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getOrCreateConversation(sessionId?: string): Promise<Conversation> {
    if (sessionId) {
      const existing = await this.prisma.conversation.findUnique({
        where: { id: sessionId },
      });
      if (existing) {
        log.debug({ sessionId }, 'Found existing conversation');
        return existing;
      }
      log.debug({ sessionId }, 'Session ID not found - creating new conversation');
    }

    const conversation = await this.prisma.conversation.create({
      data: { channel: 'web' },
    });
    log.info({ conversationId: conversation.id }, 'Created new conversation');
    return conversation;
  }

  async addMessage(
    conversationId: string,
    sender: 'user' | 'ai',
    text: string,
    status: MessageStatus = 'completed'
  ): Promise<Message> {
    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          sender,
          text,
          status,
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    log.debug(
      { messageId: message.id, conversationId, sender, status },
      'Message saved'
    );
    return message;
  }

  async getRecentMessages(
    conversationId: string,
    limit: number
  ): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId, status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return messages.reverse();
  }

  async getConversationWithMessages(
    conversationId: string
  ): Promise<(Conversation & { messages: Message[] }) | null> {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}
