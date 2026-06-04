import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';
import { ChatRepository } from './modules/chat/chat.repository.js';
import { ChatService } from './modules/chat/chat.service.js';
import { createLLMService } from './services/llm/llm.service.js';
import { createChatRouter } from './modules/chat/chat.routes.js';
import { createCacheService, type CacheService } from './services/cache/cache.service.js';

// ── Prisma ──────────────────────────────────────────────────────────
const prisma = new PrismaClient({
  log:
    env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

// ── Redis (optional) ────────────────────────────────────────────────
let cacheService: CacheService | undefined;

if (env.REDIS_URL) {
  cacheService = createCacheService({
    redisUrl: env.REDIS_URL,
    defaultTTL: env.REDIS_CACHE_TTL,
    keyPrefix: 'llm',
  });
}

// ── Dependency wiring ───────────────────────────────────────────────
const llmService = createLLMService(
  {
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
    model: env.OPENAI_MODEL,
    maxTokens: env.MAX_TOKENS,
    maxRetries: 3,
    retryBaseDelay: 1000,
    requestTimeoutMs: env.LLM_TIMEOUT_MS,
  },
  cacheService
);
const chatRepository = new ChatRepository(prisma);
const chatService = new ChatService(chatRepository, llmService, {
  maxHistoryMessages: env.MAX_HISTORY_MESSAGES,
});

const chatRouter = createChatRouter(chatService, {
  maxMessageLength: env.MAX_MESSAGE_LENGTH,
});
const app = createApp(chatRouter, async () => {
  await prisma.$queryRaw`SELECT 1`;
});

// ── Start server ────────────────────────────────────────────────────
async function start(): Promise<void> {
  // Connect Redis (non-blocking — app works without it)
  if (cacheService) {
    await cacheService.connect();
    logger.info(
      { url: env.REDIS_URL, ttl: env.REDIS_CACHE_TTL },
      'Redis cache enabled'
    );
  } else {
    logger.info('Redis cache not configured — running without cache');
  }

  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV, redis: !!cacheService },
      `🚀 Spur Chat Server listening on port ${env.PORT} (${env.NODE_ENV})`
    );
  });

  // ── Graceful shutdown ───────────────────────────────────────────
  let isShuttingDown = false;

  async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, 'Received shutdown signal — closing gracefully');

    const forceShutdownTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out');
      process.exit(1);
    }, 10000);
    forceShutdownTimer.unref();

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        logger.info('HTTP server closed');
        resolve();
      });
    });

    if (cacheService) {
      await cacheService.disconnect();
    }

    await prisma.$disconnect();
    logger.info('Prisma disconnected');

    clearTimeout(forceShutdownTimer);
    process.exit(0);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
