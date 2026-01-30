// Shared types between client and server
// These are duplicated from server for client-side type safety

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'member';
    tenantId?: string;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    apiKey: string;
    ownerId: string;
    settings: TenantSettings;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TenantSettings {
    aiProvider: 'gemini' | 'openai';
    defaultModel?: string;
    agentName?: string;
    greeting?: string;
    systemContext?: string;
    maxTokensPerMessage: number;
    maxMessagesPerConversation?: number;
    rateLimitPerMinute: number;
    allowedDomains?: string[];
    widgetTheme: WidgetTheme;
}

export interface WidgetTheme {
    primaryColor: string;
    fontFamily: string;
    borderRadius: number;
    position: 'bottom-right' | 'bottom-left';
    headerText: string;
    placeholderText: string;
    buttonIcon: string;
}

export interface RegisteredApi {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    baseUrl: string;
    authType: 'none' | 'bearer' | 'api_key' | 'basic' | 'oauth2';
    authConfig?: Record<string, unknown>;
    headers?: Map<string, string>;
    endpoints: ApiEndpoint[];
    openApiSpec?: OpenApiSpec;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiEndpoint {
    id: string;
    name: string;
    description?: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    parameters?: ApiParameter[];
    requestBody?: {
        contentType: string;
        schema: Record<string, unknown>;
    };
    responseSchema?: Record<string, unknown>;
    isActive: boolean;
}

export interface ApiParameter {
    name: string;
    in: 'query' | 'path' | 'header' | 'body';
    description?: string;
    required: boolean;
    type: string;
    default?: unknown;
    enum?: unknown[];
}

export interface OpenApiSpec {
    openapi: string;
    info: {
        title: string;
        version: string;
        description?: string;
    };
    paths: Record<string, Record<string, unknown>>;
    components?: Record<string, unknown>;
}

export interface Conversation {
    id: string;
    tenantId: string;
    sessionId: string;
    userId?: string;
    title?: string;
    messageCount: number;
    lastMessageAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    toolCalls?: ToolCall[];
    toolResults?: ToolResult[];
    tokens?: {
        input: number;
        output: number;
    };
    createdAt: Date;
}

export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}

export interface ToolResult {
    toolCallId: string;
    name: string;
    result: unknown;
    error?: string;
    duration?: number;
}

// Analytics types
export interface AnalyticsOverview {
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
}

export interface UsageStats {
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
}

// API Response types
export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AuthResponse {
    user: User;
    tenant?: Tenant;
    accessToken: string;
    refreshToken: string;
}
