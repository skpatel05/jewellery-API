export type { ApiErrorResponse, ApiSuccessResponse } from '../utils/response.js';

export type UserRole = 'admin' | 'customer';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
