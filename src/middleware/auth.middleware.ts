import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/jwt.js';
import { AppError } from './error.middleware.js';
import type { UserRole } from '../types/index.js';

/**
 * Authenticates requests using a Bearer JWT.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required');
    }

    const token = authHeader.slice('Bearer '.length);
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restricts access to routes by user role.
 */
export const authorizeRoles =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions');
    }

    next();
  };
