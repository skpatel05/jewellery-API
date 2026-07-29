import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

type RequestProperty = 'body' | 'query' | 'params';

/**
 * Validates the given request property against a Zod schema.
 * Parsed values replace the original property on the request object.
 */
export const validate =
  (schema: ZodType, property: RequestProperty = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req[property] = schema.parse(req[property]);
      next();
    } catch (error) {
      next(error);
    }
  };
