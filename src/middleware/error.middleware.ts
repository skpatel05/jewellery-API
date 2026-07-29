import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: string[];
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const isProduction = process.env.NODE_ENV === 'production';

const formatZodErrors = (error: ZodError): string[] => {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
};

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      return new AppError(409, 'A record with this value already exists');
    case 'P2025':
      return new AppError(404, 'Record not found');
    default:
      return new AppError(500, isProduction ? 'Database operation failed' : error.message);
  }
};

/**
 * Global error handler. Must be registered after all routes.
 */
export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formatZodErrors(err),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const appError = handlePrismaError(err);
    res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      errors: appError.errors,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: isProduction ? 'Invalid database query' : err.message,
      errors: [],
    });
    return;
  }

  if (err instanceof Error) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        errors: [],
      });
      return;
    }

    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      message: isProduction ? 'Internal server error' : err.message,
      errors: [],
    });
    return;
  }

  console.error('Unknown error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [],
  });
};
