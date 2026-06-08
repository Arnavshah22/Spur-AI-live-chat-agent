import { describe, expect, it, vi } from 'vitest';
import { LLMError } from '../../types/errors.js';
import { ChatService } from './chat.service.js';
import type {
  ChatRepositoryPort,
  LLMServicePort,
} from './chat.service.js';
import type { Conversation, Message, MessageStatus } from '@prisma/client';

const now = new Date('2026-06-03T00:00:00.000Z');

function createConversation(): Conversation {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    channel: 'web',
    metadata: null,
    lastActivityAt: now,
    followUpSentAt: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

function createMessage(
  sender: 'user' | 'ai',
  text: string,
  status: MessageStatus = 'completed'
): Message {
  return {
    id: `${sender}-${text}`,
    conversationId: createConversation().id,
    sender,
    text,
    status,
    createdAt: now,
  };
}

function createRepository(
  conversation = createConversation(),
  recentMessages: Message[] = []
): ChatRepositoryPort {
  return {
    getOrCreateConversation: vi.fn().mockResolvedValue(conversation),
    addMessage: vi
      .fn()
      .mockImplementation(
        async (
          conversationId: string,
          sender: 'user' | 'ai',
          text: string,
          status: MessageStatus = 'completed'
        ) => ({ ...createMessage(sender, text, status), conversationId })
      ),
    getRecentMessages: vi.fn().mockResolvedValue(recentMessages),
    getConversationWithMessages: vi.fn().mockResolvedValue(null),
  };
}

async function collectEvents(service: ChatService) {
  const events = [];
  for await (const event of service.sendMessage({ message: 'hello' })) {
    events.push(event);
  }
  return events;
}

describe('ChatService', () => {
  it('persists both messages and completes a successful stream', async () => {
    const repository = createRepository(
      createConversation(),
      [createMessage('user', 'previous question')]
    );
    const llmService: LLMServicePort = {
      generateReplyStream: vi.fn(async function* () {
        yield 'Hello';
        yield ' there';
      }),
    };
    const service = new ChatService(repository, llmService, {
      maxHistoryMessages: 10,
    });

    const events = await collectEvents(service);

    expect(repository.addMessage).toHaveBeenNthCalledWith(
      1,
      createConversation().id,
      'user',
      'hello'
    );
    expect(repository.addMessage).toHaveBeenNthCalledWith(
      2,
      createConversation().id,
      'ai',
      'Hello there'
    );
    expect(events.at(-1)).toEqual({
      type: 'done',
      data: {
        sessionId: createConversation().id,
        reply: 'Hello there',
      },
    });
  });

  it('preserves the session and persists a friendly AI error on LLM failure', async () => {
    const repository = createRepository();
    const llmService: LLMServicePort = {
      generateReplyStream: vi.fn(async function* () {
        throw new LLMError('Our support agent is temporarily unavailable.');
      }),
    };
    const service = new ChatService(repository, llmService, {
      maxHistoryMessages: 10,
    });

    const events = await collectEvents(service);

    expect(repository.addMessage).toHaveBeenNthCalledWith(
      2,
      createConversation().id,
      'ai',
      'Our support agent is temporarily unavailable.',
      'failed'
    );
    expect(events).toEqual([
      {
        type: 'error',
        data: {
          message: 'Our support agent is temporarily unavailable.',
          sessionId: createConversation().id,
          code: 'LLM_ERROR',
          statusCode: 502,
        },
      },
    ]);
  });

  it('does not expose unknown internal errors to the user', async () => {
    const repository = createRepository();
    const llmService: LLMServicePort = {
      generateReplyStream: vi.fn(async function* () {
        throw new Error('database password is secret');
      }),
    };
    const service = new ChatService(repository, llmService, {
      maxHistoryMessages: 10,
    });

    const events = await collectEvents(service);

    expect(JSON.stringify(events)).not.toContain('database password is secret');
    expect(events[0]).toMatchObject({
      type: 'error',
      data: {
        sessionId: createConversation().id,
        code: 'INTERNAL_ERROR',
        statusCode: 500,
      },
    });
  });
});
