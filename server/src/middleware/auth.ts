import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { TenantModel, UserModel } from '../database/index.js';
import { ERROR_CODES } from '../types/index.js';
import { AppError } from '../utils/helpers.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401, ERROR_CODES.UNAUTHORIZED);
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, config.JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
            tenantId?: string;
        };

        const user = await UserModel.findById(decoded.userId);

        if (!user || !user.isActive) {
            throw new AppError('User not found or inactive', 401, ERROR_CODES.UNAUTHORIZED);
        }

        req.user = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            tenantId: user.tenantId?.toString(),
        };

        if (user.tenantId) {
            const tenant = await TenantModel.findById(user.tenantId);
            if (tenant && tenant.isActive) {
                req.tenant = {
                    id: tenant._id.toString(),
                    name: tenant.name,
                    apiKey: tenant.apiKey,
                };
            }
        }

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new AppError('Token expired', 401, ERROR_CODES.TOKEN_EXPIRED));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError('Invalid token', 401, ERROR_CODES.TOKEN_INVALID));
        } else {
            next(error);
        }
    }
}

export async function authenticateApiKey(req: Request, _res: Response, next: NextFunction) {
    try {
        const apiKey = req.headers['x-api-key'] as string || req.query.apiKey as string;

        if (!apiKey) {
            throw new AppError('API key is required', 401, ERROR_CODES.UNAUTHORIZED);
        }

        const tenant = await TenantModel.findOne({ apiKey, isActive: true });

        if (!tenant) {
            throw new AppError('Invalid API key', 401, ERROR_CODES.UNAUTHORIZED);
        }

        req.tenant = {
            id: tenant._id.toString(),
            name: tenant.name,
            apiKey: tenant.apiKey,
            settings: tenant.settings,
        };

        req.user = {
            userId: tenant.ownerId,
            tenantId: tenant._id.toString(),
        };

        next();
    } catch (error) {
        next(error);
    }
}

export function requireRole(...roles: string[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED));
        }

        if (req.user.role && !roles.includes(req.user.role)) {
            return next(new AppError('Insufficient permissions', 403, ERROR_CODES.UNAUTHORIZED));
        }

        next();
    };
}

export async function requireTenant(req: Request, _res: Response, next: NextFunction) {
    if (!req.tenant) {
        return next(new AppError('Tenant not found', 403, ERROR_CODES.UNAUTHORIZED));
    }
    next();
}
