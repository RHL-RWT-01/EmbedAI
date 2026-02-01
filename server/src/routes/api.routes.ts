import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant, validate } from '../middleware/index';
import { apiService } from '../services/index';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

const createApiSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    baseUrl: z.string().url(),
    authType: z.enum(['none', 'bearer', 'api_key', 'basic', 'oauth2']).optional(),
    authConfig: z.record(z.unknown()).optional(),
    headers: z.record(z.string()).optional(),
    openApiSpec: z.record(z.unknown()).optional(),
});

const updateApiSchema = createApiSchema.partial().extend({
    isActive: z.boolean().optional(),
});

const endpointSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    path: z.string().min(1),
    parameters: z
        .array(
            z.object({
                name: z.string(),
                in: z.enum(['query', 'path', 'header', 'body']),
                description: z.string().optional(),
                required: z.boolean().optional(),
                type: z.string().optional(),
                default: z.unknown().optional(),
                enum: z.array(z.unknown()).optional(),
            })
        )
        .optional(),
    requestBody: z
        .object({
            contentType: z.string(),
            schema: z.record(z.unknown()),
        })
        .optional(),
    responseSchema: z.record(z.unknown()).optional(),
    isActive: z.boolean().optional(),
});

// List all APIs
router.get(
    '/',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const { page, limit, isActive } = req.query;
        const result = await apiService.getAll(req.user!.tenantId!, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            isActive: isActive ? isActive === 'true' : undefined,
        });
        res.json(result);
    })
);

// Create API
router.post(
    '/',
    authenticate,
    requireTenant,
    validate(createApiSchema),
    asyncHandler(async (req, res) => {
        const api = await apiService.create(req.user!.tenantId!, req.body);
        res.status(201).json(api);
    })
);

// Get API by ID
router.get(
    '/:id',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const api = await apiService.getById(req.user!.tenantId!, req.params.id);
        res.json(api);
    })
);

// Update API
router.patch(
    '/:id',
    authenticate,
    requireTenant,
    validate(updateApiSchema),
    asyncHandler(async (req, res) => {
        const api = await apiService.update(req.user!.tenantId!, req.params.id, req.body);
        res.json(api);
    })
);

// Delete API
router.delete(
    '/:id',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const result = await apiService.delete(req.user!.tenantId!, req.params.id);
        res.json(result);
    })
);

// Add endpoint to API
router.post(
    '/:id/endpoints',
    authenticate,
    requireTenant,
    validate(endpointSchema),
    asyncHandler(async (req, res) => {
        const api = await apiService.addEndpoint(req.user!.tenantId!, req.params.id, req.body);
        res.status(201).json(api);
    })
);

// Update endpoint
router.patch(
    '/:id/endpoints/:endpointId',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const api = await apiService.updateEndpoint(
            req.user!.tenantId!,
            req.params.id,
            req.params.endpointId,
            req.body
        );
        res.json(api);
    })
);

// Delete endpoint
router.delete(
    '/:id/endpoints/:endpointId',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const api = await apiService.deleteEndpoint(
            req.user!.tenantId!,
            req.params.id,
            req.params.endpointId
        );
        res.json(api);
    })
);

export default router;

