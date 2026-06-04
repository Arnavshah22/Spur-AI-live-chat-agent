import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/errors.js';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(
        'Validation failed',
        result.error.flatten().fieldErrors
      );
    }
    req.body = result.data;
    next();
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      throw new ValidationError(
        'Invalid parameters',
        result.error.flatten().fieldErrors
      );
    }
    req.params = result.data;
    next();
  };
};
