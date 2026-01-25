import mongoose, { Document, Schema } from 'mongoose';
import type { Conversation, Message, ToolCall, ToolResult } from '../../types/index';
import { generateId } from '../../utils/helpers';

// Conversation
export interface ConversationDocument extends Omit<Conversation, 'id'>, Document { }

const conversationSchema = new Schema<ConversationDocument>(
    {
        tenantId: {
            type: String,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        userId: String,
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        title: String,
        metadata: Schema.Types.Mixed,
        messageCount: {
            type: Number,
            default: 0,
        },
        lastMessageAt: Date,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = (ret._id as any)?.toString();
                delete (ret as any)._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    }
);

conversationSchema.index({ tenantId: 1, sessionId: 1 });
conversationSchema.index({ tenantId: 1, createdAt: -1 });
conversationSchema.index({ tenantId: 1, lastMessageAt: -1 });

export const ConversationModel = mongoose.model<ConversationDocument>('Conversation', conversationSchema);

// Message
export interface MessageDocument extends Omit<Message, 'id'>, Document { }

const toolCallSchema = new Schema<ToolCall>(
    {
        id: { type: String, default: () => generateId() },
        name: { type: String, required: true },
        arguments: { type: Schema.Types.Mixed, default: {} },
    },
    { _id: false }
);

const toolResultSchema = new Schema<ToolResult>(
    {
        toolCallId: { type: String, required: true },
        name: { type: String, required: true },
        result: Schema.Types.Mixed,
        error: String,
        duration: { type: Number, default: 0 },
    },
    { _id: false }
);

const messageSchema = new Schema<MessageDocument>(
    {
        conversationId: {
            type: String,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ['user', 'assistant', 'system', 'tool'],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        toolCalls: [toolCallSchema],
        toolResults: [toolResultSchema],
        metadata: Schema.Types.Mixed,
        tokens: {
            input: Number,
            output: Number,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = (ret._id as any)?.toString();
                delete (ret as any)._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel = mongoose.model<MessageDocument>('Message', messageSchema);
