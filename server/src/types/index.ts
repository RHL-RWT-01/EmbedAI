// User types
export interface User {
    id: string;
    email: string;
    name: string;
    password?: string;
    role: 'admin' | 'member' | 'viewer';
    tenantId?: string;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email?: string;
                role?: string;
                tenantId?: string;
            };
            tenant?: {
                id: string;
                name?: string;
                apiKey: string;
                settings?: TenantSettings;
            };
        }
    }
}

// Tenant types
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
    greeting?: string;
    placeholder?: string;
    widgetTheme?: WidgetTheme;
    rateLimits?: {
        messagesPerMinute: number;
        messagesPerDay: number;
    };
    allowedDomains?: string[];
}

// Widget types
export interface WidgetTheme {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: number;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    width: number;
    height: number;
}

export const DEFAULT_WIDGET_THEME: WidgetTheme = {
    primaryColor: '#6366f1',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    borderRadius: 16,
    position: 'bottom-right',
    width: 380,
    height: 600,
};

// Registered API types
export interface RegisteredApi {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    baseUrl: string;
    authType: 'none' | 'api_key' | 'bearer' | 'basic' | 'oauth2';
    authConfig?: Record<string, unknown>;
    headers?: Record<string, string>;
    openApiSpec?: OpenApiSpec;
    endpoints: ApiEndpoint[];
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
    paths: Record<string, unknown>;
    components?: Record<string, unknown>;
}

// Conversation types
export interface Conversation {
    id: string;
    tenantId: string;
    userId?: string;
    sessionId: string;
    title?: string;
    metadata?: Record<string, unknown>;
    messageCount: number;
    lastMessageAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Message types
export interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    toolCalls?: ToolCall[];
    toolResults?: ToolResult[];
    metadata?: Record<string, unknown>;
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
    duration: number;
}

// Socket event types
export interface ChatMessagePayload {
    message: string;
    content: string;
    sessionId?: string;
    userId?: string;
    conversationId?: string;
    metadata?: Record<string, unknown>;
}

export interface ChatResponsePayload {
    message: Message;
    conversationId: string;
    toolsExecuted?: number;
}

export interface ChatErrorPayload {
    error: string;
    code?: string;
}

export interface TypingIndicatorPayload {
    isTyping: boolean;
    conversationId?: string;
}

export interface ToolExecutionPayload {
    toolCallId: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: unknown;
    error?: string;
}

// AI types
export interface AIMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    toolCalls?: ToolCall[];
    toolResults?: ToolResult[];
}

export interface AITool {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, unknown>;
        required?: string[];
    };
}

export interface AIGenerateOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    tools?: AITool[];
    systemPrompt?: string;
}

export interface AIGenerateResult {
    content: string;
    toolCalls?: ToolCall[];
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
}

// Socket events
export const SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',

    // Chat
    CHAT_JOIN: 'chat:join',
    CHAT_LEAVE: 'chat:leave',
    CHAT_MESSAGE: 'chat:message',
    CHAT_RESPONSE: 'chat:response',
    CHAT_ERROR: 'chat:error',
    CHAT_TYPING_INDICATOR: 'chat:typing',

    // Messages
    SEND_MESSAGE: 'send:message',
    MESSAGE_RECEIVED: 'message:received',
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',

    // Conversations
    JOIN_CONVERSATION: 'conversation:join',
    CONVERSATION_HISTORY: 'conversation:history',

    // Tool execution
    TOOL_EXECUTION_START: 'tool:start',
    TOOL_EXECUTION_COMPLETE: 'tool:complete',
    TOOL_EXECUTION_ERROR: 'tool:error',
} as const;

// Socket event interfaces for type-safe socket.io
export interface ClientToServerEvents {
    [SOCKET_EVENTS.SEND_MESSAGE]: (data: ChatMessagePayload, callback?: (response: any) => void) => void;
    [SOCKET_EVENTS.JOIN_CONVERSATION]: (data: { conversationId: string }) => void;
    [SOCKET_EVENTS.CHAT_JOIN]: (data: { sessionId?: string }) => void;
    [SOCKET_EVENTS.CHAT_LEAVE]: () => void;
}

export interface ServerToClientEvents {
    [SOCKET_EVENTS.MESSAGE_RECEIVED]: (data: ChatResponsePayload) => void;
    [SOCKET_EVENTS.TYPING_START]: () => void;
    [SOCKET_EVENTS.TYPING_STOP]: () => void;
    [SOCKET_EVENTS.CONVERSATION_HISTORY]: (data: { conversationId: string; messages: Message[] }) => void;
    [SOCKET_EVENTS.CHAT_RESPONSE]: (data: ChatResponsePayload) => void;
    [SOCKET_EVENTS.CHAT_ERROR]: (data: ChatErrorPayload) => void;
    [SOCKET_EVENTS.ERROR]: (data: { message: string }) => void;
    [SOCKET_EVENTS.TOOL_EXECUTION_START]: (data: ToolExecutionPayload) => void;
    [SOCKET_EVENTS.TOOL_EXECUTION_COMPLETE]: (data: ToolExecutionPayload) => void;
    [SOCKET_EVENTS.TOOL_EXECUTION_ERROR]: (data: ToolExecutionPayload) => void;
}

export interface SocketData {
    userId?: string;
    tenantId?: string;
    sessionId?: string;
    conversationId?: string;
}

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        ME: '/api/auth/me',
    },
    TENANT: {
        GET: '/api/tenant',
        UPDATE: '/api/tenant',
        REGENERATE_KEY: '/api/tenant/regenerate-key',
    },
    APIS: {
        LIST: '/api/apis',
        CREATE: '/api/apis',
        GET: '/api/apis/:id',
        UPDATE: '/api/apis/:id',
        DELETE: '/api/apis/:id',
    },
    CONVERSATIONS: {
        LIST: '/api/conversations',
        GET: '/api/conversations/:id',
        DELETE: '/api/conversations/:id',
        MESSAGES: '/api/conversations/:id/messages',
    },
    ANALYTICS: {
        OVERVIEW: '/api/analytics/overview',
        USAGE: '/api/analytics/usage',
    },
    WIDGET: {
        CONFIG: '/api/widget/config',
    },
} as const;

// Error codes
export const ERROR_CODES = {
    // Authentication
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    UNAUTHORIZED: 'UNAUTHORIZED',

    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',

    // Resources
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    CONFLICT: 'CONFLICT',

    // Rate limiting
    RATE_LIMITED: 'RATE_LIMITED',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

    // Server
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

    // AI
    AI_ERROR: 'AI_ERROR',
    AI_RATE_LIMITED: 'AI_RATE_LIMITED',

    // API execution
    API_EXECUTION_ERROR: 'API_EXECUTION_ERROR',
    API_TIMEOUT: 'API_TIMEOUT',
} as const;

// AI config
export const AI_CONFIG = {
    GEMINI: {
        DEFAULT_MODEL: 'gemini-1.5-flash',
        MAX_TOKENS: 8192,
        TEMPERATURE: 0.7,
    },
    OPENAI: {
        DEFAULT_MODEL: 'gpt-4o-mini',
        MAX_TOKENS: 4096,
        TEMPERATURE: 0.7,
    },
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    TIMEOUT: 30000,
} as const;

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
} as const;
