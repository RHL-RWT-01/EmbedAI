import mongoose, { Document, Schema } from 'mongoose';

// Usage Log
export interface UsageLogDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    userId?: string;
    sessionId: string;
    conversationId?: mongoose.Types.ObjectId;
    type: 'message' | 'api_call' | 'tool_execution';
    tokens?: {
        input: number;
        output: number;
    };
    duration?: number;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}

const usageLogSchema = new Schema<UsageLogDocument>(
    {
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        userId: String,
        sessionId: {
            type: String,
            required: true,
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
        },
        type: {
            type: String,
            enum: ['message', 'api_call', 'tool_execution'],
            required: true,
        },
        tokens: {
            input: Number,
            output: Number,
        },
        duration: Number,
        metadata: Schema.Types.Mixed,
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

usageLogSchema.index({ tenantId: 1, createdAt: -1 });
usageLogSchema.index({ tenantId: 1, type: 1, createdAt: -1 });
usageLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90 days TTL

export const UsageLogModel = mongoose.model<UsageLogDocument>('UsageLog', usageLogSchema);

// API Call Log
export interface ApiCallLogDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    conversationId?: mongoose.Types.ObjectId;
    apiId: mongoose.Types.ObjectId;
    endpointId: string;
    method: string;
    url: string;
    statusCode?: number;
    duration: number;
    error?: string;
    createdAt: Date;
}

const apiCallLogSchema = new Schema<ApiCallLogDocument>(
    {
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
        },
        apiId: {
            type: Schema.Types.ObjectId,
            ref: 'RegisteredApi',
            required: true,
        },
        endpointId: {
            type: String,
            required: true,
        },
        method: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        statusCode: Number,
        duration: {
            type: Number,
            required: true,
        },
        error: String,
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

apiCallLogSchema.index({ tenantId: 1, createdAt: -1 });
apiCallLogSchema.index({ tenantId: 1, apiId: 1, createdAt: -1 });
apiCallLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days TTL

export const ApiCallLogModel = mongoose.model<ApiCallLogDocument>('ApiCallLog', apiCallLogSchema);
