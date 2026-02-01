import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant, validate } from '../middleware/index';
import { tenantService } from '../services/index';
import { asyncHandler } from '../utils/async-handler';

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
            allowedDomains: z.array(z.string()).optional(),
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
router.post(
    '/',
    authenticate,
    validate({ body: createTenantSchema }),
    asyncHandler(async (req, res) => {
        const { name } = req.body;
        const tenant = await tenantService.create(name, req.user!.userId);
        res.status(201).json(tenant);
    })
);

// Get current tenant
router.get(
    '/me',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const tenant = await tenantService.getById(req.user!.tenantId!);
        res.json(tenant);
    })
);

// Update tenant
router.patch(
    '/me',
    authenticate,
    requireTenant,
    validate({ body: updateTenantSchema }),
    asyncHandler(async (req, res) => {
        const tenant = await tenantService.update(req.user!.tenantId!, req.body);
        res.json(tenant);
    })
);

// Regenerate API key
router.post(
    '/me/regenerate-key',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const result = await tenantService.regenerateApiKey(req.user!.tenantId!);
        res.json(result);
    })
);

export default router;

