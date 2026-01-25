import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant, validate } from '../middleware/index';
import { tenantService } from '../services/index';

const router = Router();

const createTenantSchema = z.object({
    name: z.string().min(2).max(100),
});

const updateTenantSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    settings: z
        .object({
            aiProvider: z.enum(['gemini', 'openai']).optional(),
            defaultModel: z.string().optional(),
            maxTokensPerMessage: z.number().min(100).max(10000).optional(),
            maxMessagesPerConversation: z.number().min(10).max(1000).optional(),
            rateLimitPerMinute: z.number().min(1).max(1000).optional(),
            widgetTheme: z
                .object({
                    primaryColor: z.string().optional(),
                    fontFamily: z.string().optional(),
                    borderRadius: z.number().optional(),
                    position: z.enum(['bottom-right', 'bottom-left']).optional(),
                    headerText: z.string().optional(),
                    placeholderText: z.string().optional(),
                    buttonIcon: z.string().optional(),
                })
                .optional(),
        })
        .optional(),
});

// Create tenant (requires authenticated user without tenant)
router.post('/', authenticate, validate({ body: createTenantSchema }), async (req, res, next) => {
    try {
        const { name } = req.body;
        const tenant = await tenantService.create(name, req.user!.userId);
        res.status(201).json(tenant);
    } catch (error) {
        next(error);
    }
});

// Get current tenant
router.get('/me', authenticate, requireTenant, async (req, res, next) => {
    try {
        const tenant = await tenantService.getById(req.user!.tenantId!);
        res.json(tenant);
    } catch (error) {
        next(error);
    }
});

// Update tenant
router.patch('/me', authenticate, requireTenant, validate({ body: updateTenantSchema }), async (req, res, next) => {
    try {
        const tenant = await tenantService.update(req.user!.tenantId!, req.body);
        res.json(tenant);
    } catch (error) {
        next(error);
    }
});

// Regenerate API key
router.post('/me/regenerate-key', authenticate, requireTenant, async (req, res, next) => {
    try {
        const result = await tenantService.regenerateApiKey(req.user!.tenantId!);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
