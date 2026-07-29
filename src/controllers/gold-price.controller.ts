import type { Request, Response } from 'express';
import * as goldPriceService from '../services/gold-price.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getGoldPrice = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = await goldPriceService.getGoldPrice();
  sendSuccess(res, result, 'Gold price retrieved successfully');
});
