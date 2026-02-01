import { NextFunction, Request, Response } from 'express';
import config from '../config/index';
import { ERROR_CODES } from '../types/index';
import { AppError } from '../utils/helpers';
import { getRedisClient, isRedisEnabled } from '../utils/redis';

interface RateLimitOptions {
    windowMs?: number;
    maxRequests?: number;
    keyPrefix?: string;
    keyGenerator?: (req: Request) => string;
}

// In-memory store for rate limiting when Redis is disabled
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
        if (now > entry.resetTime) {
            memoryStore.delete(key);
        }
    }
}, 60000); // Cleanup every minute

export function createRateLimiter(options: RateLimitOptions = {}) {
    const {
        windowMs = parseInt(config.RATE_LIMIT_WINDOW_MS),
        maxRequests = parseInt(config.RATE_LIMIT_MAX_REQUESTS),
        keyPrefix = 'rl',
        keyGenerator = defaultKeyGenerator,
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        const key = `${keyPrefix}:${keyGenerator(req)}`;

        try {
            if (isRedisEnabled()) {
                // Use Redis for rate limiting
                const redis = getRedisClient();
                if (!redis) {
                    // Redis is enabled but client failed, allow request
                    return next();
                }

                const current = await redis.incr(key);

                if (current === 1) {
                    await redis.pexpire(key, windowMs);
                }

                const ttl = await redis.pttl(key);

                res.setHeader('X-RateLimit-Limit', maxRequests);
                res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
                res.setHeader('X-RateLimit-Reset', Date.now() + ttl);

                if (current > maxRequests) {
                    throw new AppError('Too many requests', 429, ERROR_CODES.RATE_LIMITED);
                }
            } else {
                // Use in-memory store for rate limiting
                const now = Date.now();
                const entry = memoryStore.get(key);

                if (!entry || now > entry.resetTime) {
                    // Create new entry
                    memoryStore.set(key, {
                        count: 1,
                        resetTime: now + windowMs,
                    });
                    res.setHeader('X-RateLimit-Limit', maxRequests);
                    res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
                    res.setHeader('X-RateLimit-Reset', now + windowMs);
                } else {
                    // Increment existing entry
                    entry.count++;
                    res.setHeader('X-RateLimit-Limit', maxRequests);
                    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
                    res.setHeader('X-RateLimit-Reset', entry.resetTime);

                    if (entry.count > maxRequests) {
                        throw new AppError('Too many requests', 429, ERROR_CODES.RATE_LIMITED);
                    }
                }
            }

            next();
        } catch (error) {
            if (error instanceof AppError) {
                return next(error);
            }
            // If rate limiting fails, allow request
            next();
        }
    };
}

function defaultKeyGenerator(req: Request): string {
    // Per end-user rate limiting
    if (req.user?.userId) {
        return `user:${req.user.userId}`;
    }

    // Fallback to IP + session
    const sessionId = req.headers['x-session-id'] as string;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (sessionId) {
        return `session:${sessionId}:${ip}`;
    }

    return `ip:${ip}`;
}

// Pre-configured limiters
export const apiLimiter = createRateLimiter({
    windowMs: 60000,
    maxRequests: 100,
    keyPrefix: 'rl:api',
});

export const authLimiter = createRateLimiter({
    windowMs: 60000,
    maxRequests: 10,
    keyPrefix: 'rl:auth',
});

export const chatLimiter = createRateLimiter({
    windowMs: 60000,
    maxRequests: 30,
    keyPrefix: 'rl:chat',
});

