import { getFromCache, setCache } from '../lib/cache.js';

const CACHE_TTL = 120;
const CACHE_KEY = 'gold-price';
const BASE_PRICE = 2000;
const VARIATION = 0.05;

function generateGoldPrice(): number {
  const change = (Math.random() - 0.5) * 2 * VARIATION;
  const price = BASE_PRICE * (1 + change);
  return Math.round(price * 100) / 100;
}

export const getGoldPrice = async (): Promise<{ price: number; currency: string; unit: string }> => {
  const cached = await getFromCache<{ price: number; currency: string; unit: string }>(CACHE_KEY);
  if (cached) return cached.data;
  console.log('Cache Miss');

  const data = { price: generateGoldPrice(), currency: 'USD', unit: 'per ounce' };

  await setCache(CACHE_KEY, data, CACHE_TTL);

  return data;
};
