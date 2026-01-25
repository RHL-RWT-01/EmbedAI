const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

class ApiClient {
    private baseUrl: string;
    private accessToken: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setToken(token: string | null) {
        this.accessToken = token;
    }

    getToken(): string | null {
        return this.accessToken;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
        };

        if (this.accessToken) {
            requestHeaders['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Request failed') as Error & {
                status: number;
                code: string;
            };
            error.status = response.status;
            error.code = data.code;
            throw error;
        }

        return data;
    }

    // Generic HTTP methods
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body });
    }

    async put<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body });
    }

    async patch<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, { method: 'PATCH', body });
    }

    async delete<T = void>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // Auth endpoints
    async register(email: string, password: string, name: string) {
        return this.request<{
            user: { id: string; email: string; name: string; role: string };
            accessToken: string;
            refreshToken: string;
        }>('/api/auth/register', {
            method: 'POST',
            body: { email, password, name },
        });
    }

    async login(email: string, password: string) {
        return this.request<{
            user: { id: string; email: string; name: string; role: string; tenantId?: string };
            accessToken: string;
            refreshToken: string;
        }>('/api/auth/login', {
            method: 'POST',
            body: { email, password },
        });
    }

    async refreshToken(refreshToken: string) {
        return this.request<{
            accessToken: string;
            refreshToken: string;
        }>('/api/auth/refresh', {
            method: 'POST',
            body: { refreshToken },
        });
    }

    async getMe() {
        return this.request<{
            user: { id: string; email: string; name: string; role: string; tenantId?: string };
            tenant?: { id: string; name: string; apiKey: string; settings: unknown };
        }>('/api/auth/me');
    }

    // Tenant endpoints
    async createTenant(name: string) {
        return this.request<{
            id: string;
            name: string;
            apiKey: string;
            settings: unknown;
        }>('/api/tenants', {
            method: 'POST',
            body: { name },
        });
    }

    async getTenant() {
        return this.request<{
            id: string;
            name: string;
            apiKey: string;
            settings: unknown;
        }>('/api/tenants/me');
    }

    async updateTenant(data: { name?: string; settings?: unknown }) {
        return this.request<{
            id: string;
            name: string;
            settings: unknown;
        }>('/api/tenants/me', {
            method: 'PATCH',
            body: data,
        });
    }

    async regenerateApiKey() {
        return this.request<{ apiKey: string }>('/api/tenants/me/regenerate-key', {
            method: 'POST',
        });
    }

    // API endpoints
    async getApis(params?: { page?: number; limit?: number; isActive?: boolean }) {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));

        const queryString = query.toString();
        return this.request<{
            items: Array<{
                id: string;
                name: string;
                description?: string;
                baseUrl: string;
                endpoints: unknown[];
                isActive: boolean;
                createdAt: string;
            }>;
            pagination: { page: number; limit: number; total: number; totalPages: number };
        }>(`/api/apis${queryString ? `?${queryString}` : ''}`);
    }

    async getApi(id: string) {
        return this.request<{
            id: string;
            name: string;
            description?: string;
            baseUrl: string;
            authType: string;
            authConfig?: unknown;
            headers?: Record<string, string>;
            endpoints: Array<{
                id: string;
                name: string;
                description?: string;
                method: string;
                path: string;
                parameters?: unknown[];
                isActive: boolean;
            }>;
            isActive: boolean;
        }>(`/api/apis/${id}`);
    }

    async createApi(data: {
        name: string;
        description?: string;
        baseUrl: string;
        authType?: string;
        authConfig?: unknown;
        headers?: Record<string, string>;
        openApiSpec?: unknown;
    }) {
        return this.request<{ id: string; name: string }>('/api/apis', {
            method: 'POST',
            body: data,
        });
    }

    async updateApi(
        id: string,
        data: Partial<{
            name: string;
            description: string;
            baseUrl: string;
            authType: string;
            authConfig: unknown;
            headers: Record<string, string>;
            isActive: boolean;
        }>
    ) {
        return this.request(`/api/apis/${id}`, {
            method: 'PATCH',
            body: data,
        });
    }

    async deleteApi(id: string) {
        return this.request<{ success: boolean }>(`/api/apis/${id}`, {
            method: 'DELETE',
        });
    }

    async addEndpoint(
        apiId: string,
        endpoint: {
            name: string;
            description?: string;
            method: string;
            path: string;
            parameters?: unknown[];
            requestBody?: unknown;
            isActive?: boolean;
        }
    ) {
        return this.request(`/api/apis/${apiId}/endpoints`, {
            method: 'POST',
            body: endpoint,
        });
    }

    async updateEndpoint(apiId: string, endpointId: string, data: Partial<{ isActive: boolean }>) {
        return this.request(`/api/apis/${apiId}/endpoints/${endpointId}`, {
            method: 'PATCH',
            body: data,
        });
    }

    async deleteEndpoint(apiId: string, endpointId: string) {
        return this.request(`/api/apis/${apiId}/endpoints/${endpointId}`, {
            method: 'DELETE',
        });
    }

    // Conversation endpoints
    async getConversations(params?: { page?: number; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));

        const queryString = query.toString();
        return this.request<{
            items: Array<{
                id: string;
                title?: string;
                messageCount: number;
                lastMessageAt?: string;
                createdAt: string;
            }>;
            pagination: { page: number; limit: number; total: number; totalPages: number };
        }>(`/api/conversations${queryString ? `?${queryString}` : ''}`);
    }

    async getConversation(id: string) {
        return this.request<{
            id: string;
            title?: string;
            messageCount: number;
            createdAt: string;
        }>(`/api/conversations/${id}`);
    }

    async getConversationMessages(id: string, params?: { page?: number; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));

        const queryString = query.toString();
        return this.request<{
            items: Array<{
                id: string;
                role: string;
                content: string;
                toolCalls?: unknown[];
                toolResults?: unknown[];
                createdAt: string;
            }>;
            pagination: { page: number; limit: number; total: number; totalPages: number };
        }>(`/api/conversations/${id}/messages${queryString ? `?${queryString}` : ''}`);
    }

    async deleteConversation(id: string) {
        return this.request<{ success: boolean }>(`/api/conversations/${id}`, {
            method: 'DELETE',
        });
    }

    // Analytics endpoints
    async getAnalyticsOverview(period?: 'day' | 'week' | 'month') {
        const query = period ? `?period=${period}` : '';
        return this.request<{
            totalConversations: number;
            totalMessages: number;
            totalApiCalls: number;
            activeUsers: number;
            avgResponseTime: number;
            avgMessagesPerConversation: number;
            conversationsTrend: number;
            messagesTrend: number;
            apiCallsTrend: number;
            usersTrend: number;
        }>(`/api/analytics/overview${query}`);
    }

    async getAnalyticsUsage(period?: 'day' | 'week' | 'month') {
        const query = period ? `?period=${period}` : '';
        return this.request<{
            dailyStats: Array<{
                date: string;
                conversations: number;
                messages: number;
                apiCalls: number;
            }>;
            topApis: Array<{
                name: string;
                calls: number;
                successRate: number;
            }>;
        }>(`/api/analytics/usage${query}`);
    }
}

export const apiClient = new ApiClient(API_URL);
export default apiClient;
