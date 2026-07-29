import { redis } from '../lib/redis.js';

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
  try {
    if (redis.status === 'ready') {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        console.log('Cache Hit');
        return JSON.parse(cached);
      }
    }
    console.log('Cache Miss');
  } catch {
    console.log('Cache Miss');
  }

  const data = { price: generateGoldPrice(), currency: 'USD', unit: 'per ounce' };

  try {
    if (redis.status === 'ready') {
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(data));
    }
  } catch {
    // silently fail
  }

  return data;
};
