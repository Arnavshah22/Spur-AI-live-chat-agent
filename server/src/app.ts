import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './config/logger.js';
import type { Router } from 'express';

export type ReadinessCheck = () => Promise<void>;

export function createApp(
  chatRouter: Router,
  pushRouter: Router,
  readinessCheck?: ReadinessCheck
): express.Application {
  const app = express();

  // ── Security & parsing ───────────────────────────────────────────
  app.use(helmet());
  
  // Handle CORS with support for wildcards
  const corsOrigin = env.CORS_ORIGIN === '*' 
    ? '*' 
    : env.CORS_ORIGIN.split(',').map(o => o.trim());
  
  app.use(
    cors({
      origin: corsOrigin,
      credentials: corsOrigin === '*' ? false : true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  // ── Logging 
  app.use(requestLogger);

  // ── Routes
  app.use('/api/chat', chatRouter);
  app.use('/chat', chatRouter);
  app.use('/api/push', pushRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/ready', async (_req, res) => {
    try {
      await readinessCheck?.();
      res.json({ status: 'ready', timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({
        status: 'not_ready',
        message: 'Database connection unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Internal endpoint for cron job to process stale conversations
  app.post('/api/internal/process-followups', async (_req, res) => {
    try {
      const { followUpService } = await import('./services/followup/followup.service.js');
      const result = await followUpService.processStaleConversations();
      res.json({ status: 'ok', ...result });
    } catch (error) {
      logger.error({ error }, 'Failed to process follow-ups');
      res.status(500).json({ status: 'error', message: 'Internal error' });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({
      status: 'error',
      code: 'NOT_FOUND',
      message: 'Route not found',
    });
  });

  // ── Error handling (must be last) ────────────────────────────────
  app.use(errorHandler);

  return app;
}
