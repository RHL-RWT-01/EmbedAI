import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant, validate } from '../middleware/index';
import { conversationService } from '../services/index';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

const updateConversationSchema = z.object({
    title: z.string().min(1).max(200),
});

// List conversations
router.get(
    '/',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const { page, limit, userId } = req.query;
        const result = await conversationService.getAll(req.user!.tenantId!, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            userId: userId as string | undefined,
        });
        res.json(result);
    })
);

// Get conversation by ID
router.get(
    '/:id',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const conversation = await conversationService.getById(req.user!.tenantId!, req.params.id);
        res.json(conversation);
    })
);

// Get conversation messages
router.get(
    '/:id/messages',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const { page, limit } = req.query;
        const result = await conversationService.getMessages(req.user!.tenantId!, req.params.id, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        res.json(result);
    })
);

// Update conversation
router.patch(
    '/:id',
    authenticate,
    requireTenant,
    validate(updateConversationSchema),
    asyncHandler(async (req, res) => {
        const conversation = await conversationService.updateTitle(
            req.user!.tenantId!,
            req.params.id,
            req.body.title
        );
        res.json(conversation);
    })
);

// Delete conversation
router.delete(
    '/:id',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const result = await conversationService.delete(req.user!.tenantId!, req.params.id);
        res.json(result);
    })
);

export default router;

