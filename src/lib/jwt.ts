import jwt, { type SignOptions } from 'jsonwebtoken';
import { AppError } from '../middleware/error.middleware.js';
import type { JwtPayload, UserRole } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

const signOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
};

const isUserRole = (value: unknown): value is UserRole => {
  return value === 'admin' || value === 'customer';
};

/**
 * Signs a JWT for an authenticated user.
 */
export const signToken = (userId: string, role: UserRole): string => {
  if (!JWT_SECRET) {
    throw new AppError(500, 'JWT secret is not configured');
  }

  return jwt.sign({ sub: userId, role }, JWT_SECRET, signOptions);
};

/**
 * Verifies and decodes a JWT.
 */
export const verifyToken = (token: string): JwtPayload => {
  if (!JWT_SECRET) {
    throw new AppError(500, 'JWT secret is not configured');
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === 'string') {
    throw new AppError(401, 'Invalid token');
  }

  const { sub, role } = decoded as Record<string, unknown>;

  if (typeof sub !== 'string' || !isUserRole(role)) {
    throw new AppError(401, 'Invalid token');
  }

  return { sub, role };
};
