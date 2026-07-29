import { redis } from './redis.js';

export async function getFromCache<T>(key: string): Promise<{ data: T } | null> {
  try {
    if (redis.status !== 'ready') return null;
    const raw = await redis.get(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as T;
    console.log('Cache Hit');
    return { data };
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttl: number): Promise<void> {
  try {
    if (redis.status !== 'ready') return;
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    if (redis.status !== 'ready') return;
    await redis.del(...keys);
  } catch {
    // silently fail
  }
}
