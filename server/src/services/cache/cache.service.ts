import { createHash } from 'node:crypto';
import { Redis } from 'ioredis';
import { createChildLogger } from '../../config/logger.js';

const log = createChildLogger('cache');

export interface CacheServiceConfig {
  redisUrl: string;
  defaultTTL: number; // seconds
  keyPrefix: string;
}

/**
 * Redis-backed cache with graceful degradation.
 *
 * If Redis is unavailable or any operation fails, the error is logged
 * and the application continues as if the cache were empty. This means
 * the LLM will be called directly — no data is ever lost.
 */
export class CacheService {
  private readonly client: Redis;
  private readonly defaultTTL: number;
  private readonly keyPrefix: string;
  private connected = false;

  constructor(config: CacheServiceConfig) {
    this.defaultTTL = config.defaultTTL;
    this.keyPrefix = config.keyPrefix;

    this.client = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times: number) {
        // Retry with exponential backoff, cap at 5 seconds
        const delay = Math.min(times * 500, 5000);
        return delay;
      },
      lazyConnect: true,
      // Enable TLS for Upstash (rediss:// protocol)
      tls: config.redisUrl.startsWith('rediss://') ? {} : undefined,
    });

    this.client.on('connect', () => {
      this.connected = true;
      log.info('Redis connected');
    });

    this.client.on('error', (err: Error) => {
      this.connected = false;
      log.warn({ err: err.message }, 'Redis error — cache disabled');
    });

    this.client.on('close', () => {
      this.connected = false;
      log.info('Redis connection closed');
    });
  }

  /** Attempt to connect to Redis. Non-blocking: never throws. */
  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (err) {
      log.warn(
        { err: (err as Error).message },
        'Could not connect to Redis — running without cache'
      );
    }
  }

  /** Gracefully disconnect from Redis. */
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      log.info('Redis disconnected');
    } catch {
      // Ignore errors during shutdown
    }
  }

  /**
   * Build a deterministic cache key from the conversation history
   * and the current user message.
   */
  buildCacheKey(
    historyTexts: Array<{ role: string; content: string }>,
    userMessage: string
  ): string {
    const payload = JSON.stringify([...historyTexts, { role: 'user', content: userMessage }]);
    const hash = createHash('sha256').update(payload).digest('hex');
    return `${this.keyPrefix}:${hash}`;
  }

  /** Get a cached value. Returns null on miss or if Redis is unavailable. */
  async get(key: string): Promise<string | null> {
    if (!this.connected) return null;

    try {
      return await this.client.get(key);
    } catch (err) {
      log.warn({ err: (err as Error).message, key }, 'Cache GET failed');
      return null;
    }
  }

  /** Set a value in the cache. Fails silently if Redis is unavailable. */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.connected) return;

    try {
      await this.client.set(key, value, 'EX', ttl ?? this.defaultTTL);
    } catch (err) {
      log.warn({ err: (err as Error).message, key }, 'Cache SET failed');
    }
  }

  /** Check whether the Redis client is currently connected. */
  isConnected(): boolean {
    return this.connected;
  }
}

export function createCacheService(config: CacheServiceConfig): CacheService {
  return new CacheService(config);
}
