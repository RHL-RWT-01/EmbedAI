import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/index';
import { authService } from '../services/index';
import { ERROR_CODES } from '../types/index';
import { AppError } from '../utils/helpers';

const router = Router();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const refreshSchema = z.object({
    refreshToken: z.string(),
});

// Register
router.post('/register', validate({ body: registerSchema }), async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        const result = await authService.register(email, password, name);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Login
router.post('/login', validate({ body: loginSchema }), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Refresh token
router.post('/refresh', validate({ body: refreshSchema }), async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshToken(refreshToken);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get current user (protected)
router.get('/me', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError('Unauthorized', 401, ERROR_CODES.UNAUTHORIZED);
        }

        const token = authHeader.substring(7);
        const jwt = await import('jsonwebtoken');
        const { config } = await import('../config/index.js');

        const decoded = jwt.default.verify(token, config.JWT_SECRET) as { userId: string };
        const result = await authService.getMe(decoded.userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
