import mongoose, { Document, Schema } from 'mongoose';
import type { Tenant, TenantSettings } from '../../types/index';
import { DEFAULT_WIDGET_THEME } from '../../types/index';
import { generateApiKey, slugify } from '../../utils/helpers';

export interface TenantDocument extends Omit<Tenant, 'id'>, Document { }

const tenantSettingsSchema = new Schema<TenantSettings>(
    {
        greeting: { type: String, default: 'Hello! How can I help you today?' },
        placeholder: { type: String, default: 'Type your message...' },
        widgetTheme: {
            type: {
                primaryColor: { type: String, default: DEFAULT_WIDGET_THEME.primaryColor },
                backgroundColor: { type: String, default: DEFAULT_WIDGET_THEME.backgroundColor },
                textColor: { type: String, default: DEFAULT_WIDGET_THEME.textColor },
                fontFamily: { type: String, default: DEFAULT_WIDGET_THEME.fontFamily },
                borderRadius: { type: Number, default: DEFAULT_WIDGET_THEME.borderRadius },
                position: {
                    type: String,
                    enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
                    default: DEFAULT_WIDGET_THEME.position,
                },
                width: { type: Number, default: DEFAULT_WIDGET_THEME.width },
                height: { type: Number, default: DEFAULT_WIDGET_THEME.height },
            },
            default: () => ({ ...DEFAULT_WIDGET_THEME }),
        },
        rateLimits: {
            type: {
                messagesPerMinute: { type: Number, default: 20 },
                messagesPerDay: { type: Number, default: 1000 },
            },
            default: () => ({ messagesPerMinute: 20, messagesPerDay: 1000 }),
        },
        allowedDomains: { type: [String], default: [] },
    },
    { _id: false }
);

const tenantSchema = new Schema<TenantDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        apiKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        ownerId: {
            type: String,
            required: true,
            index: true,
        },
        settings: {
            type: tenantSettingsSchema,
            default: () => ({}),
        },
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

tenantSchema.pre('validate', function (next) {
    if (this.isNew) {
        if (!this.slug) {
            this.slug = slugify(this.name);
        }
        if (!this.apiKey) {
            this.apiKey = generateApiKey();
        }
    }
    next();
});

export const TenantModel = mongoose.model<TenantDocument>('Tenant', tenantSchema);
