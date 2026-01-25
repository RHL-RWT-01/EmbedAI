import { TenantModel, UserModel } from '../database/index';
import { ERROR_CODES, DEFAULT_WIDGET_THEME } from '../types/index';
import type { TenantSettings } from '../types/index';
import { AppError, generateApiKey, slugify } from '../utils/helpers';

export class TenantService {
    async create(name: string, ownerId: string) {
        const existingTenant = await TenantModel.findOne({ ownerId });

        if (existingTenant) {
            throw new AppError('User already has a tenant', 409, ERROR_CODES.ALREADY_EXISTS);
        }

        let slug = slugify(name);
        const existingSlug = await TenantModel.findOne({ slug });
        if (existingSlug) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        const tenant = await TenantModel.create({
            name,
            slug,
            ownerId,
            apiKey: generateApiKey(),
        });

        await UserModel.findByIdAndUpdate(ownerId, { tenantId: tenant._id });

        return tenant.toJSON();
    }

    async getById(tenantId: string) {
        const tenant = await TenantModel.findById(tenantId);

        if (!tenant) {
            throw new AppError('Tenant not found', 404, ERROR_CODES.NOT_FOUND);
        }

        return tenant.toJSON();
    }

    async getByApiKey(apiKey: string) {
        const tenant = await TenantModel.findOne({ apiKey, isActive: true });

        if (!tenant) {
            throw new AppError('Invalid API key', 401, ERROR_CODES.UNAUTHORIZED);
        }

        return tenant.toJSON();
    }

    async update(tenantId: string, data: { name?: string; settings?: Partial<TenantSettings> }) {
        const tenant = await TenantModel.findById(tenantId);

        if (!tenant) {
            throw new AppError('Tenant not found', 404, ERROR_CODES.NOT_FOUND);
        }

        if (data.name) {
            tenant.name = data.name;
        }

        if (data.settings) {
            const currentSettings = tenant.settings || {};
            const currentTheme = currentSettings.widgetTheme || DEFAULT_WIDGET_THEME;
            const newTheme = data.settings.widgetTheme;

            tenant.settings = {
                ...currentSettings,
                ...data.settings,
                widgetTheme: newTheme ? {
                    primaryColor: newTheme.primaryColor || currentTheme.primaryColor,
                    backgroundColor: newTheme.backgroundColor || currentTheme.backgroundColor,
                    textColor: newTheme.textColor || currentTheme.textColor,
                    fontFamily: newTheme.fontFamily || currentTheme.fontFamily,
                    borderRadius: newTheme.borderRadius ?? currentTheme.borderRadius,
                    position: newTheme.position || currentTheme.position,
                    width: newTheme.width ?? currentTheme.width,
                    height: newTheme.height ?? currentTheme.height,
                } : currentTheme,
            };
        }

        await tenant.save();
        return tenant.toJSON();
    }

    async regenerateApiKey(tenantId: string) {
        const tenant = await TenantModel.findById(tenantId);

        if (!tenant) {
            throw new AppError('Tenant not found', 404, ERROR_CODES.NOT_FOUND);
        }

        tenant.apiKey = generateApiKey();
        await tenant.save();

        return { apiKey: tenant.apiKey };
    }
}

export const tenantService = new TenantService();
