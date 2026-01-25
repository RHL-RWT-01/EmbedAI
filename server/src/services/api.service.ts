import { RegisteredApiModel } from '../database/index';
import type { ApiEndpoint, OpenApiSpec } from '../types/index';
import { ERROR_CODES } from '../types/index';
import { AppError, generateId, parsePagination } from '../utils/helpers';

export class ApiService {
    async create(
        tenantId: string,
        data: {
            name: string;
            description?: string;
            baseUrl: string;
            authType?: string;
            authConfig?: Record<string, unknown>;
            headers?: Record<string, string>;
            openApiSpec?: OpenApiSpec;
        }
    ) {
        const existingApi = await RegisteredApiModel.findOne({
            tenantId,
            name: data.name,
        });

        if (existingApi) {
            throw new AppError('API with this name already exists', 409, ERROR_CODES.ALREADY_EXISTS);
        }

        let endpoints: ApiEndpoint[] = [];

        if (data.openApiSpec?.paths) {
            endpoints = this.parseOpenApiSpec(data.openApiSpec);
        }

        const api = await RegisteredApiModel.create({
            tenantId,
            ...data,
            endpoints,
        });

        return api.toJSON();
    }

    async getAll(
        tenantId: string,
        options: { page?: number; limit?: number; isActive?: boolean } = {}
    ) {
        const { page, limit, skip } = parsePagination(options.page, options.limit);

        const query: Record<string, unknown> = { tenantId };
        if (typeof options.isActive === 'boolean') {
            query.isActive = options.isActive;
        }

        const [items, total] = await Promise.all([
            RegisteredApiModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
            RegisteredApiModel.countDocuments(query),
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

    async getById(tenantId: string, apiId: string) {
        const api = await RegisteredApiModel.findOne({ _id: apiId, tenantId });

        if (!api) {
            throw new AppError('API not found', 404, ERROR_CODES.NOT_FOUND);
        }

        return api.toJSON();
    }

    async update(
        tenantId: string,
        apiId: string,
        data: Partial<{
            name: string;
            description: string;
            baseUrl: string;
            authType: string;
            authConfig: Record<string, unknown>;
            headers: Record<string, string>;
            isActive: boolean;
            openApiSpec: OpenApiSpec;
        }>
    ) {
        const api = await RegisteredApiModel.findOne({ _id: apiId, tenantId });

        if (!api) {
            throw new AppError('API not found', 404, ERROR_CODES.NOT_FOUND);
        }

        if (data.openApiSpec?.paths) {
            data['endpoints' as keyof typeof data] = this.parseOpenApiSpec(data.openApiSpec) as never;
        }

        Object.assign(api, data);
        await api.save();

        return api.toJSON();
    }

    async delete(tenantId: string, apiId: string) {
        const result = await RegisteredApiModel.deleteOne({ _id: apiId, tenantId });

        if (result.deletedCount === 0) {
            throw new AppError('API not found', 404, ERROR_CODES.NOT_FOUND);
        }

        return { success: true };
    }

    async addEndpoint(tenantId: string, apiId: string, endpoint: Omit<ApiEndpoint, 'id'>) {
        const api = await RegisteredApiModel.findOne({ _id: apiId, tenantId });

        if (!api) {
            throw new AppError('API not found', 404, ERROR_CODES.NOT_FOUND);
        }

        const newEndpoint: ApiEndpoint = {
            ...endpoint,
            id: generateId(),
        };

        api.endpoints.push(newEndpoint);
        await api.save();

        return api.toJSON();
    }

    async updateEndpoint(
        tenantId: string,
        apiId: string,
        endpointId: string,
        data: Partial<ApiEndpoint>
    ) {
        const api = await RegisteredApiModel.findOne({ _id: apiId, tenantId });

        if (!api) {
            throw new AppError('API not found', 404, ERROR_CODES.NOT_FOUND);
        }

        const endpointIndex = api.endpoints.findIndex((e) => e.id === endpointId);

        if (endpointIndex === -1) {
            throw new AppError('Endpoint not found', 404, ERROR_CODES.NOT_FOUND);
        }

        Object.assign(api.endpoints[endpointIndex], data);
        await api.save();

        return api.toJSON();
    }

    async deleteEndpoint(tenantId: string, apiId: string, endpointId: string) {
        const api = await RegisteredApiModel.findOne({ _id: apiId, tenantId });

        if (!api) {
            throw new AppError('API not found', 404, ERROR_CODES.NOT_FOUND);
        }

        api.endpoints = api.endpoints.filter((e) => e.id !== endpointId);
        await api.save();

        return api.toJSON();
    }

    private parseOpenApiSpec(spec: OpenApiSpec): ApiEndpoint[] {
        const endpoints: ApiEndpoint[] = [];

        for (const [path, methods] of Object.entries(spec.paths)) {
            for (const [method, operation] of Object.entries(methods as Record<string, unknown>)) {
                if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
                    const op = operation as {
                        operationId?: string;
                        summary?: string;
                        description?: string;
                        parameters?: Array<{
                            name: string;
                            in: string;
                            description?: string;
                            required?: boolean;
                            schema?: { type?: string; default?: unknown; enum?: unknown[] };
                        }>;
                        requestBody?: {
                            content?: {
                                [contentType: string]: {
                                    schema?: Record<string, unknown>;
                                };
                            };
                        };
                    };

                    endpoints.push({
                        id: generateId(),
                        name: op.operationId || `${method}_${path.replace(/\//g, '_')}`,
                        description: op.summary || op.description,
                        method: method.toUpperCase() as ApiEndpoint['method'],
                        path,
                        parameters: op.parameters?.map((p) => ({
                            name: p.name,
                            in: p.in as 'query' | 'path' | 'header' | 'body',
                            description: p.description,
                            required: p.required || false,
                            type: p.schema?.type || 'string',
                            default: p.schema?.default,
                            enum: p.schema?.enum,
                        })),
                        requestBody: op.requestBody?.content
                            ? {
                                contentType: Object.keys(op.requestBody.content)[0],
                                schema:
                                    op.requestBody.content[Object.keys(op.requestBody.content)[0]]?.schema || {},
                            }
                            : undefined,
                        isActive: true,
                    });
                }
            }
        }

        return endpoints;
    }
}

export const apiService = new ApiService();
