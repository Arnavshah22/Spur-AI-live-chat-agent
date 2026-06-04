import pino from 'pino';
import { env } from './env.js';

const transport =
  env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport,
});

export function createChildLogger(module: string): pino.Logger {
  return logger.child({ module });
}
