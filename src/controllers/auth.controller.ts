import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validation.js';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.register(req.body as RegisterInput);
  sendSuccess(res, result, 'User registered successfully', 201);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body as LoginInput);
  sendSuccess(res, result, 'Login successful');
});
