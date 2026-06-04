import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AppError } from '../types/errors.js';
import { createChildLogger } from '../config/logger.js';
import { env } from '../config/env.js';

const log = createChildLogger('errorHandler');

interface ErrorResponseBody {
  status: 'error';
  code: string;
  message: string;
  details?: unknown;
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  log.error({ err }, 'Unhandled error');

  const httpError = err as Error & { status?: number; type?: string };

  if (httpError.status === 400 && httpError.type === 'entity.parse.failed') {
    res.status(400).json({
      status: 'error',
      code: 'INVALID_JSON',
      message: 'Request body contains invalid JSON',
    });
    return;
  }

  if (httpError.status === 413) {
    res.status(413).json({
      status: 'error',
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Request body is too large',
    });
    return;
  }

  // --- AppError (our custom hierarchy) ---
  if (err instanceof AppError) {
    const body: ErrorResponseBody = {
      status: 'error',
      code: err.code,
      message: err.message,
    };
    if (err.details && env.NODE_ENV !== 'production') {
      body.details = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  // --- Zod validation errors ---
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // --- Prisma known request errors ---
  if (err instanceof PrismaClientKnownRequestError) {
    let statusCode = 500;
    let message = 'Database error';

    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'A record with this value already exists';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference — related record not found';
        break;
      default:
        statusCode = 500;
        message = 'Database error';
    }

    res.status(statusCode).json({
      status: 'error',
      code: 'DATABASE_ERROR',
      message,
      ...(env.NODE_ENV !== 'production' && { details: err.message }),
    });
    return;
  }

  // --- Catch-all for unknown errors ---
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred';

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message,
  });
};
