import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().trim().max(2000).optional(),
  price: z.number().positive('Price must be positive'),
  category: z.string().trim().max(100).optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
  material: z.string().trim().max(100).optional(),
  weight: z.number().positive('Weight must be positive').optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
