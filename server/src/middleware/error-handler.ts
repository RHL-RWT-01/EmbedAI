import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/helpers';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
    logger.error('Error:', err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
            },
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: err.message,
            },
        });
    }

    // Mongoose duplicate key error
    if ((err as NodeJS.ErrnoException).code === 'E11000') {
        return res.status(409).json({
            success: false,
            error: {
                code: 'ALREADY_EXISTS',
                message: 'Resource already exists',
            },
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        },
    });
}

export function notFoundHandler(req: Request, res: Response) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
}
