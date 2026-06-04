import OpenAI from 'openai';
import { SYSTEM_PROMPT } from './prompts.js';
import { withRetry } from './retry.js';
import { createChildLogger } from '../../config/logger.js';
import { LLMError, RateLimitError } from '../../types/errors.js';
import type { LLMMessage, LLMServiceConfig } from './llm.types.js';
import type { MessageDTO } from '../../types/index.js';
import type { CacheService } from '../cache/cache.service.js';

const log = createChildLogger('llm');

export class LLMService {
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly maxRetries: number;
  private readonly retryBaseDelay: number;
  private readonly cache?: CacheService;

  constructor(config: LLMServiceConfig, cache?: CacheService) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      maxRetries: 0,
      timeout: config.requestTimeoutMs,
    });
    this.model = config.model;
    this.maxTokens = config.maxTokens;
    this.maxRetries = config.maxRetries;
    this.retryBaseDelay = config.retryBaseDelay;
    this.cache = cache;
  }

  async *generateReplyStream(
    history: MessageDTO[],
    userMessage: string,
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const messages = this.buildMessages(history, userMessage);

    // ── Cache check ─────────────────────────────────────────────────
    if (this.cache) {
      const cacheKey = this.cache.buildCacheKey(
        messages.map((m) => ({ role: m.role, content: m.content })),
        userMessage
      );

      const cached = await this.cache.get(cacheKey);
      if (cached) {
        log.info('Cache HIT — returning cached LLM response');
        yield cached;
        return;
      }

      // Cache miss — stream from the LLM and save the result
      log.debug('Cache MISS — streaming from LLM');
      yield* this.streamAndCache(messages, signal, cacheKey);
      return;
    }

    // ── No cache configured — stream directly ───────────────────────
    yield* this.streamFromLLM(messages, signal);
  }

  private async *streamAndCache(
    messages: LLMMessage[],
    signal: AbortSignal | undefined,
    cacheKey: string
  ): AsyncGenerator<string> {
    let fullReply = '';

    for await (const token of this.streamFromLLM(messages, signal)) {
      fullReply += token;
      yield token;
    }

    // Persist to cache asynchronously — don't block the response
    if (fullReply.trim()) {
      this.cache!.set(cacheKey, fullReply).catch((err) => {
        log.warn({ err }, 'Failed to persist LLM response to cache');
      });
    }
  }

  private async *streamFromLLM(
    messages: LLMMessage[],
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    log.debug(
      { model: this.model, messageCount: messages.length },
      'Starting LLM stream'
    );

    try {
      const stream = await withRetry(
        () =>
          this.client.chat.completions.create(
            {
              model: this.model,
              messages,
              max_tokens: this.maxTokens,
              stream: true,
            },
            { signal }
          ),
        {
          maxRetries: this.maxRetries,
          baseDelay: this.retryBaseDelay,
          signal,
        }
      );

      for await (const chunk of stream) {
        signal?.throwIfAborted();
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }
      throw this.classifyError(error);
    }
  }

  private buildMessages(
    history: MessageDTO[],
    userMessage: string
  ): LLMMessage[] {
    const messages: LLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    for (const message of history) {
      messages.push({
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.text,
      });
    }

    messages.push({ role: 'user', content: userMessage });
    return messages;
  }

  private classifyError(error: unknown): LLMError | RateLimitError {
    if (error instanceof LLMError || error instanceof RateLimitError) {
      return error;
    }

    if (error instanceof OpenAI.APIError) {
      const status = error.status;

      if (status === 429) {
        return new RateLimitError(
          'Our support agent is receiving too many requests. Please try again shortly.'
        );
      }
      if (status === 401 || status === 403) {
        return new LLMError(
          'Our support agent is temporarily unavailable. Please try again later.',
          { providerStatus: status, providerCode: error.code }
        );
      }
      if (status === 408 || error.code === 'ETIMEDOUT') {
        return new LLMError(
          'Our support agent took too long to respond. Please try again.'
        );
      }

      return new LLMError(
        'Our support agent is temporarily unavailable. Please try again.',
        { providerStatus: status, providerCode: error.code }
      );
    }

    return new LLMError(
      'Our support agent is temporarily unavailable. Please try again.'
    );
  }
}

export function createLLMService(
  config: LLMServiceConfig,
  cache?: CacheService
): LLMService {
  return new LLMService(config, cache);
}
