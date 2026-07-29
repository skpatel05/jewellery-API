import { z } from 'zod';
import type { OrderStatus } from '@prisma/client';

const orderStatuses: [OrderStatus, ...OrderStatus[]] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
      }),
    )
    .min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatuses),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
