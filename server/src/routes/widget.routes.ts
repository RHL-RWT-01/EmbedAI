import { Router } from 'express';
import { z } from 'zod';
import { authenticateApiKey, chatLimiter, validate } from '../middleware/index';
import { chatService, conversationService, tenantService } from '../services/index';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

const chatMessageSchema = z.object({
    message: z.string().min(1).max(10000),
    sessionId: z.string().min(1),
    conversationId: z.string().optional(),
    userId: z.string().optional(),
});

const initSchema = z.object({
    sessionId: z.string().min(1),
});

// Initialize widget - returns tenant settings
router.post(
    '/init',
    authenticateApiKey,
    validate({ body: initSchema }),
    asyncHandler(async (req, res) => {
        const { sessionId } = req.body;
        const tenant = await tenantService.getById(req.tenant!.id);

        // Get or create conversation
        const conversation = await conversationService.getOrCreate(tenant.id, sessionId);

        // Get recent messages if conversation exists
        const messages = await conversationService.getRecentMessages(conversation.id, 50);

        res.json({
            tenant: {
                name: tenant.name,
                settings: tenant.settings,
            },
            conversation: {
                id: conversation.id,
                title: conversation.title,
                messages,
            },
        });
    })
);

// Send chat message
router.post(
    '/message',
    authenticateApiKey,
    chatLimiter,
    validate({ body: chatMessageSchema }),
    asyncHandler(async (req, res) => {
        const { message, sessionId, conversationId, userId } = req.body;

        const result = await chatService.processMessage(message, {
            tenantId: req.tenant!.id,
            sessionId,
            userId,
            conversationId,
        });

        res.json(result);
    })
);

// Get conversation history
router.get(
    '/conversation/:conversationId',
    authenticateApiKey,
    asyncHandler(async (req, res) => {
        const { conversationId } = req.params;
        const { page, limit } = req.query;

        const conversation = await conversationService.getById(req.tenant!.id, conversationId);
        const messages = await conversationService.getMessages(req.tenant!.id, conversationId, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });

        res.json({
            conversation,
            ...messages,
        });
    })
);

// Health check for widget
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

