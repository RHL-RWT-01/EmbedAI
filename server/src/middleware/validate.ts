import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';
import { ERROR_CODES } from '../types/index.js';
import { AppError } from '../utils/helpers.js';

interface ValidateOptions {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export function validate(schemas: ValidateOptions | ZodSchema) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            // If a single schema is passed, assume it's for the body
            if (schemas instanceof z.ZodType) {
                req.body = await schemas.parseAsync(req.body);
            } else {
                if (schemas.body) {
                    req.body = await schemas.body.parseAsync(req.body);
                }
                if (schemas.query) {
                    req.query = await schemas.query.parseAsync(req.query);
                }
                if (schemas.params) {
                    req.params = await schemas.params.parseAsync(req.params);
                }
            }
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                next(new AppError(messages, 400, ERROR_CODES.VALIDATION_ERROR));
            } else {
                next(error);
            }
        }
    };
}

// Common validation schemas
export const paginationSchema = z.object({
    page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
    limit: z.string().optional().transform((val) => Math.min(parseInt(val || '20', 10), 100)),
});

export const idParamSchema = z.object({
    id: z.string().min(1, 'ID is required'),
});
