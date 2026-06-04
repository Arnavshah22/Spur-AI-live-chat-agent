import { createChildLogger } from '../../config/logger.js';

const log = createChildLogger('retry');

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  retryableStatuses?: number[];
  signal?: AbortSignal;
}

function isRetryableError(
  error: unknown,
  retryableStatuses: number[]
): boolean {
  if (error instanceof Error) {
    const statusProperty = (error as unknown as Record<string, unknown>)['status'];
    if (typeof statusProperty === 'number') {
      return retryableStatuses.includes(statusProperty);
    }

    const code = (error as unknown as Record<string, unknown>)['code'];
    if (code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') {
      return true;
    }
  }
  return false;
}

async function wait(delay: number, signal?: AbortSignal): Promise<void> {
  signal?.throwIfAborted();

  await new Promise<void>((resolve, reject) => {
    const handleResolve = () => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    };
    const timer = setTimeout(handleResolve, delay);

    const handleAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason ?? new Error('Request aborted'));
    };

    signal?.addEventListener('abort', handleAbort, { once: true });
    timer.unref?.();
  });
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    retryableStatuses = [429, 500, 502, 503, 504],
    signal,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    signal?.throwIfAborted();

    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (
        signal?.aborted ||
        attempt === maxRetries ||
        !isRetryableError(error, retryableStatuses)
      ) {
        throw error;
      }

      const jitter = Math.random() * 500;
      const delay = baseDelay * Math.pow(2, attempt) + jitter;

      log.warn(
        {
          attempt: attempt + 1,
          maxRetries,
          delayMs: Math.round(delay),
          error: error instanceof Error ? error.message : String(error),
        },
        `Retrying after ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`
      );

      await wait(delay, signal);
    }
  }

  throw lastError;
}
