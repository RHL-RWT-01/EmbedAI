import Redis from 'ioredis';
import config from '../config/index.js';
import { logger } from './logger.js';

let redisClient: Redis | null = null;

export function isRedisEnabled(): boolean {
    return config.REDIS_ENABLE === 'true';
}

export function getRedisClient(): Redis | null {
    if (!isRedisEnabled()) {
        return null;
    }

    if (!redisClient) {
        const redisUrl = config.REDIS_URL;

        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError(err) {
                const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
                return targetErrors.some((e) => err.message.includes(e));
            },
        });

        redisClient.on('connect', () => {
            logger.info('Redis connected');
        });

        redisClient.on('error', (err) => {
            logger.error('Redis error:', err);
        });

        redisClient.on('close', () => {
            logger.warn('Redis connection closed');
        });
    }

    return redisClient;
}

export async function closeRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        logger.info('Redis connection closed');
    }
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    if (!redis) {
        return null;
    }

    const value = await redis.get(key);
    if (value) {
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as unknown as T;
        }
    }
    return null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const redis = getRedisClient();
    if (!redis) {
        return;
    }

    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, serialized);
    } else {
        await redis.set(key, serialized);
    }
}

export async function cacheDel(key: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) {
        return;
    }

    await redis.del(key);
}

export async function cacheDelPattern(pattern: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) {
        return;
    }

    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
}

export default { getRedisClient, closeRedis, cacheGet, cacheSet, cacheDel, cacheDelPattern, isRedisEnabled };

