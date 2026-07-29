import type { Request, Response } from 'express';
import * as productService from '../services/product.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import type { CreateProductInput, UpdateProductInput } from '../validators/product.validation.js';

export const createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.sub;
  const result = await productService.createProduct(req.body as CreateProductInput, userId);
  sendSuccess(res, result, 'Product created successfully', 201);
});

export const getAllProducts = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const products = await productService.getAllProducts();
  sendSuccess(res, products, 'Products retrieved successfully');
});

export const getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const product = await productService.getProductById(id);
  sendSuccess(res, product, 'Product retrieved successfully');
});

export const updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const product = await productService.updateProduct(id, req.body as UpdateProductInput);
  sendSuccess(res, product, 'Product updated successfully');
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  await productService.deleteProduct(id);
  sendSuccess(res, null, 'Product deleted successfully');
});
