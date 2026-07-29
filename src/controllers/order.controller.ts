import type { Request, Response } from 'express';
import * as orderService from '../services/order.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import type { CreateOrderInput, UpdateOrderStatusInput } from '../validators/order.validation.js';

export const createOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.sub;
  const result = await orderService.createOrder(req.body as CreateOrderInput, userId);
  sendSuccess(res, result, 'Order created successfully', 201);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.sub;
  const orders = await orderService.getMyOrders(userId);
  sendSuccess(res, orders, 'Orders retrieved successfully');
});

export const getOrderById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user!.sub;
  const role = req.user!.role;
  const order = await orderService.getOrderById(id, userId, role);
  sendSuccess(res, order, 'Order retrieved successfully');
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const result = await orderService.updateOrderStatus(id, req.body as UpdateOrderStatusInput);
  sendSuccess(res, result, 'Order status updated successfully');
});
