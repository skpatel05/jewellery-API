import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

/**
 * Singleton Redis client for caching and session storage.
 */
export const redis: Redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy(times: number): number | null {
    if (times > 10) {
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (error: Error) => {
  console.error('Redis connection error:', error.message);
});

/**
 * Gracefully closes the Redis connection.
 */
export async function disconnectRedis(): Promise<void> {
  if (redis.status === 'end') {
    return;
  }
  await redis.quit();
}
