import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant, validate } from '../middleware/index';
import { conversationService } from '../services/index';

const router = Router();

const updateConversationSchema = z.object({
    title: z.string().min(1).max(200),
});

// List conversations
router.get('/', authenticate, requireTenant, async (req, res, next) => {
    try {
        const { page, limit, userId } = req.query;
        const result = await conversationService.getAll(req.user!.tenantId!, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            userId: userId as string | undefined,
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get conversation by ID
router.get('/:id', authenticate, requireTenant, async (req, res, next) => {
    try {
        const conversation = await conversationService.getById(req.user!.tenantId!, req.params.id);
        res.json(conversation);
    } catch (error) {
        next(error);
    }
});

// Get conversation messages
router.get('/:id/messages', authenticate, requireTenant, async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await conversationService.getMessages(req.user!.tenantId!, req.params.id, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Update conversation
router.patch(
    '/:id',
    authenticate,
    requireTenant,
    validate(updateConversationSchema),
    async (req, res, next) => {
        try {
            const conversation = await conversationService.updateTitle(
                req.user!.tenantId!,
                req.params.id,
                req.body.title
            );
            res.json(conversation);
        } catch (error) {
            next(error);
        }
    }
);

// Delete conversation
router.delete('/:id', authenticate, requireTenant, async (req, res, next) => {
    try {
        const result = await conversationService.delete(req.user!.tenantId!, req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
