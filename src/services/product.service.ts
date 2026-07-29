import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import { AppError } from '../middleware/error.middleware.js';
import type { CreateProductInput, UpdateProductInput } from '../validators/product.validation.js';

const CACHE_TTL = 300;

const CACHE_KEYS = {
  all: 'products:all',
  byId: (id: string) => `products:${id}`,
};

async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    if (redis.status !== 'ready') return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    if (redis.status !== 'ready') return;
    await redis.setex(key, CACHE_TTL, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    if (redis.status !== 'ready') return;
    await redis.del(...keys);
  } catch {
    // silently fail
  }
}

export const createProduct = async (input: CreateProductInput, userId: string) => {
  const product = await prisma.product.create({
    data: { ...input, createdBy: userId },
  });
  await invalidateCache(CACHE_KEYS.all);
  return product;
};

export const getAllProducts = async () => {
  const cached = await getFromCache<any[]>(CACHE_KEYS.all);
  if (cached) return cached;

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  await setCache(CACHE_KEYS.all, products);
  return products;
};

export const getProductById = async (id: string) => {
  const cacheKey = CACHE_KEYS.byId(id);
  const cached = await getFromCache<any>(cacheKey);
  if (cached) return cached;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, 'Product not found');

  await setCache(cacheKey, product);
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
