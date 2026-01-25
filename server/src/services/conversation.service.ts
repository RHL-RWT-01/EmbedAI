import { ConversationModel, MessageModel } from '../database/index';
import type { Message } from '../types/index';
import { ERROR_CODES } from '../types/index';
import { AppError, parsePagination } from '../utils/helpers';

export class ConversationService {
    async create(tenantId: string, sessionId: string, userId?: string, title?: string) {
        const conversation = await ConversationModel.create({
            tenantId,
            sessionId,
            userId,
            title,
        });

        return conversation.toJSON();
    }

    async getOrCreate(tenantId: string, sessionId: string, userId?: string) {
        let conversation = await ConversationModel.findOne({
            tenantId,
            sessionId,
            isActive: true,
        });

        if (!conversation) {
            conversation = await ConversationModel.create({
                tenantId,
                sessionId,
                userId,
            });
        }

        return conversation.toJSON();
    }

    async getAll(
        tenantId: string,
        options: { page?: number; limit?: number; userId?: string } = {}
    ) {
        const { page, limit, skip } = parsePagination(options.page, options.limit);

        const query: Record<string, unknown> = { tenantId, isActive: true };
        if (options.userId) {
            query.userId = options.userId;
        }

        const [items, total] = await Promise.all([
            ConversationModel.find(query).skip(skip).limit(limit).sort({ lastMessageAt: -1, createdAt: -1 }),
            ConversationModel.countDocuments(query),
        ]);

        return {
            items: items.map((item) => item.toJSON()),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getById(tenantId: string, conversationId: string) {
        const conversation = await ConversationModel.findOne({
            _id: conversationId,
            tenantId,
        });

        if (!conversation) {
            throw new AppError('Conversation not found', 404, ERROR_CODES.NOT_FOUND);
        }

        return conversation.toJSON();
    }

    async getMessages(
        tenantId: string,
        conversationId: string,
        options: { page?: number; limit?: number } = {}
    ) {
        const conversation = await ConversationModel.findOne({
            _id: conversationId,
            tenantId,
        });

        if (!conversation) {
            throw new AppError('Conversation not found', 404, ERROR_CODES.NOT_FOUND);
        }

        const { page, limit, skip } = parsePagination(options.page, options.limit);

        const [items, total] = await Promise.all([
            MessageModel.find({ conversationId }).skip(skip).limit(limit).sort({ createdAt: 1 }),
            MessageModel.countDocuments({ conversationId }),
        ]);

        return {
            items: items.map((item) => item.toJSON()),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async addMessage(conversationId: string, message: Omit<Message, 'id' | 'createdAt'>) {
        const msg = await MessageModel.create({
            ...message,
            conversationId,
        });

        await ConversationModel.findByIdAndUpdate(conversationId, {
            $inc: { messageCount: 1 },
            lastMessageAt: new Date(),
        });

        return msg.toJSON();
    }

    async updateTitle(tenantId: string, conversationId: string, title: string) {
        const conversation = await ConversationModel.findOneAndUpdate(
            { _id: conversationId, tenantId },
            { title },
            { new: true }
        );

        if (!conversation) {
            throw new AppError('Conversation not found', 404, ERROR_CODES.NOT_FOUND);
        }

        return conversation.toJSON();
    }

    async delete(tenantId: string, conversationId: string) {
        const result = await ConversationModel.deleteOne({
            _id: conversationId,
            tenantId,
        });

        if (result.deletedCount === 0) {
            throw new AppError('Conversation not found', 404, ERROR_CODES.NOT_FOUND);
        }

        await MessageModel.deleteMany({ conversationId });

        return { success: true };
    }

    async getRecentMessages(conversationId: string, limit: number = 20): Promise<Message[]> {
        const messages = await MessageModel.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(limit);

        return messages.reverse().map((m) => m.toJSON()) as Message[];
    }
}

export const conversationService = new ConversationService();
