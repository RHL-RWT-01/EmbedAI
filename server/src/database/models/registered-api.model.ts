import mongoose, { Document, Schema } from 'mongoose';
import type { ApiEndpoint, RegisteredApi } from '../../types/index';
import { generateId } from '../../utils/helpers';

export interface RegisteredApiDocument extends Omit<RegisteredApi, 'id'>, Document { }

const apiParameterSchema = new Schema(
    {
        name: { type: String, required: true },
        in: { type: String, enum: ['query', 'path', 'header', 'body'], required: true },
        description: String,
        required: { type: Boolean, default: false },
        type: { type: String, required: true },
        default: Schema.Types.Mixed,
        enum: [Schema.Types.Mixed],
    },
    { _id: false }
);

const apiEndpointSchema = new Schema<ApiEndpoint>(
    {
        id: { type: String, default: () => generateId() },
        name: { type: String, required: true },
        description: String,
        method: {
            type: String,
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            required: true,
        },
        path: { type: String, required: true },
        parameters: [apiParameterSchema],
        requestBody: {
            contentType: String,
            schema: Schema.Types.Mixed,
        },
        responseSchema: Schema.Types.Mixed,
        isActive: { type: Boolean, default: true },
    },
    { _id: false }
);

const registeredApiSchema = new Schema<RegisteredApiDocument>(
    {
        tenantId: {
            type: String,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: String,
        baseUrl: {
            type: String,
            required: true,
        },
        authType: {
            type: String,
            enum: ['none', 'api_key', 'bearer', 'basic', 'oauth2'],
            default: 'none',
        },
        authConfig: Schema.Types.Mixed,
        headers: {
            type: Map,
            of: String,
        },
        openApiSpec: Schema.Types.Mixed,
        endpoints: [apiEndpointSchema],
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

registeredApiSchema.index({ tenantId: 1, name: 1 }, { unique: true });
registeredApiSchema.index({ tenantId: 1, isActive: 1 });

export const RegisteredApiModel = mongoose.model<RegisteredApiDocument>('RegisteredApi', registeredApiSchema);
