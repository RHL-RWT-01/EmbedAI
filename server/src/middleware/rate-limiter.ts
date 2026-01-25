import { NextFunction, Request, Response } from 'express';
import config from '../config/index';
import { ERROR_CODES } from '../types/index';
import { AppError } from '../utils/helpers';
import { getRedisClient } from '../utils/redis';

interface RateLimitOptions {
    windowMs?: number;
    maxRequests?: number;
    keyPrefix?: string;
    keyGenerator?: (req: Request) => string;
}

export function createRateLimiter(options: RateLimitOptions = {}) {
    const {
        windowMs = parseInt(config.RATE_LIMIT_WINDOW_MS),
        maxRequests = parseInt(config.RATE_LIMIT_MAX_REQUESTS),
        keyPrefix = 'rl',
        keyGenerator = defaultKeyGenerator,
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const redis = getRedisClient();
            const key = `${keyPrefix}:${keyGenerator(req)}`;

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

            next();
        } catch (error) {
            if (error instanceof AppError) {
                return next(error);
            }
            // If Redis fails, allow request
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
