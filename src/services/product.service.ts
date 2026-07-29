import { prisma } from '../lib/prisma.js';
import { getFromCache, invalidateCache, setCache } from '../lib/cache.js';
import { AppError } from '../middleware/error.middleware.js';
import type { CreateProductInput, UpdateProductInput } from '../validators/product.validation.js';

const CACHE_TTL = 300;

const CACHE_KEYS = {
  all: 'products:all',
  byId: (id: string) => `products:${id}`,
};

export const createProduct = async (input: CreateProductInput, userId: string) => {
  const product = await prisma.product.create({
    data: { ...input, createdBy: userId },
  });
  await invalidateCache(CACHE_KEYS.all);
  return product;
};

export const getAllProducts = async () => {
  const cached = await getFromCache<any[]>(CACHE_KEYS.all);
  if (cached) {
    return cached.data;
  }
  console.log('Cache Miss');

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  await setCache(CACHE_KEYS.all, products, CACHE_TTL);
  return products;
};

export const getProductById = async (id: string) => {
  const cacheKey = CACHE_KEYS.byId(id);
  const cached = await getFromCache<any>(cacheKey);
  if (cached) {
    return cached.data;
  }
  console.log('Cache Miss');

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, 'Product not found');

  await setCache(cacheKey, product, CACHE_TTL);
  return product;
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Product not found');

  const product = await prisma.product.update({
    where: { id },
    data: input,
  });

  await invalidateCache(CACHE_KEYS.all, CACHE_KEYS.byId(id));
  return product;
};

export const deleteProduct = async (id: string) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Product not found');

  await prisma.product.delete({ where: { id } });
  await invalidateCache(CACHE_KEYS.all, CACHE_KEYS.byId(id));
};
