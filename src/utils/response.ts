import type { Response } from 'express';

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
}

/**
 * Sends a consistent success JSON response.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = '',
  statusCode = 200,
): ApiSuccessResponse<T> {
  const body: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(body);
  return body;
}

/**
 * Sends a consistent error JSON response.
 * Prefer throwing AppError in route handlers so the global error middleware can format the response.
 */
export const sendError = (
  res: Response,
  message: string,
  errors: string[] = [],
  statusCode = 400,
): void => {
  const body: ApiErrorResponse = {
    success: false,
    message,
    errors,
  };
  res.status(statusCode).json(body);
};
