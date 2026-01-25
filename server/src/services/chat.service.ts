import { getAIService } from '../ai/index';
import { ApiCallLogModel, RegisteredApiModel, UsageLogModel } from '../database/index';
import type {
    AIMessage,
    AITool,
    Message,
    ToolCall,
    ToolResult
} from '../types/index';
import { logger } from '../utils/logger';
import { conversationService } from './conversation.service.js';

interface ChatContext {
    tenantId: string;
    sessionId: string;
    userId?: string;
    conversationId?: string;
}

interface ChatResult {
    message: Message;
    conversationId: string;
    toolsExecuted?: ToolResult[];
}

export class ChatService {
    private aiService = getAIService();

    async processMessage(content: string, context: ChatContext): Promise<ChatResult> {
        // Get or create conversation
        const conversation = context.conversationId
            ? await conversationService.getById(context.tenantId, context.conversationId)
            : await conversationService.getOrCreate(context.tenantId, context.sessionId, context.userId);

        // Save user message
        const userMessage = await conversationService.addMessage(conversation.id, {
            conversationId: conversation.id,
            role: 'user',
            content,
        });

        // Get conversation history
        const history = await conversationService.getRecentMessages(conversation.id, 20);

        // Get available tools (APIs)
        const tools = await this.getAvailableTools(context.tenantId);

        // Build messages for AI
        const aiMessages = this.buildAIMessages(history);

        // Generate AI response
        let result = await this.aiService.generate(aiMessages, { tools });

        // Handle tool calls
        let toolResults: ToolResult[] = [];
        if (result.toolCalls && result.toolCalls.length > 0) {
            toolResults = await this.executeToolCalls(result.toolCalls, context);

            // Add tool results to conversation and get final response
            const toolMessage: AIMessage = {
                role: 'tool',
                content: '',
                toolResults,
            };

            aiMessages.push({
                role: 'assistant',
                content: result.content,
                toolCalls: result.toolCalls,
            });
            aiMessages.push(toolMessage);

            result = await this.aiService.generate(aiMessages, { tools });
        }

        // Save assistant message
        const assistantMessage = await conversationService.addMessage(conversation.id, {
            conversationId: conversation.id,
            role: 'assistant',
            content: result.content,
            toolCalls: result.toolCalls,
            toolResults: toolResults.length > 0 ? toolResults : undefined,
            tokens: result.usage
                ? { input: result.usage.inputTokens, output: result.usage.outputTokens }
                : undefined,
        });

        // Log usage
        await UsageLogModel.create({
            tenantId: context.tenantId,
            userId: context.userId,
            sessionId: context.sessionId,
            conversationId: conversation.id,
            type: 'message',
            tokens: result.usage
                ? { input: result.usage.inputTokens, output: result.usage.outputTokens }
                : undefined,
        });

        // Generate title for new conversations
        if (history.length <= 1 && !conversation.title) {
            this.generateConversationTitle(context.tenantId, conversation.id, content).catch((err) =>
                logger.error('Failed to generate title:', err)
            );
        }

        return {
            message: assistantMessage as Message,
            conversationId: conversation.id,
            toolsExecuted: toolResults.length > 0 ? toolResults : undefined,
        };
    }

    private async getAvailableTools(tenantId: string): Promise<AITool[]> {
        const apis = await RegisteredApiModel.find({ tenantId, isActive: true });

        const tools: AITool[] = [];

        for (const api of apis) {
            for (const endpoint of api.endpoints) {
                if (!endpoint.isActive) continue;

                const properties: Record<string, unknown> = {};
                const required: string[] = [];

                endpoint.parameters?.forEach((param) => {
                    properties[param.name] = {
                        type: param.type,
                        description: param.description,
                        ...(param.enum && { enum: param.enum }),
                        ...(param.default !== undefined && { default: param.default }),
                    };

                    if (param.required) {
                        required.push(param.name);
                    }
                });

                tools.push({
                    name: `${api.name.replace(/\s+/g, '_')}_${endpoint.name}`,
                    description: `${api.name}: ${endpoint.description || endpoint.name}. Endpoint: ${endpoint.method} ${endpoint.path}`,
                    parameters: {
                        type: 'object',
                        properties,
                        required: required.length > 0 ? required : undefined,
                    },
                });
            }
        }

        return tools;
    }

    private buildAIMessages(history: Message[]): AIMessage[] {
        return history.map((msg) => ({
            role: msg.role,
            content: msg.content,
            toolCalls: msg.toolCalls,
            toolResults: msg.toolResults,
        }));
    }

    private async executeToolCalls(
        toolCalls: ToolCall[],
        context: ChatContext
    ): Promise<ToolResult[]> {
        // Execute all tool calls in parallel
        const results = await Promise.all(
            toolCalls.map((toolCall) => this.executeToolCall(toolCall, context))
        );

        return results;
    }

    private async executeToolCall(toolCall: ToolCall, context: ChatContext): Promise<ToolResult> {
        const startTime = Date.now();

        try {
            // Parse tool name to get API and endpoint
            const [apiName, ...endpointParts] = toolCall.name.split('_');
            const endpointName = endpointParts.join('_');

            const api = await RegisteredApiModel.findOne({
                tenantId: context.tenantId,
                name: { $regex: new RegExp(`^${apiName.replace(/_/g, ' ')}$`, 'i') },
                isActive: true,
            });

            if (!api) {
                throw new Error(`API not found: ${apiName}`);
            }

            const endpoint = api.endpoints.find((e) => e.name === endpointName && e.isActive);

            if (!endpoint) {
                throw new Error(`Endpoint not found: ${endpointName}`);
            }

            // Build URL with path parameters
            let url = `${api.baseUrl}${endpoint.path}`;
            const queryParams: Record<string, string> = {};

            endpoint.parameters?.forEach((param) => {
                const value = toolCall.arguments[param.name];
                if (value !== undefined) {
                    if (param.in === 'path') {
                        url = url.replace(`{${param.name}}`, encodeURIComponent(String(value)));
                    } else if (param.in === 'query') {
                        queryParams[param.name] = String(value);
                    }
                }
            });

            // Add query params
            const queryString = new URLSearchParams(queryParams).toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            // Build headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...((Array.isArray(api.headers) ? Object.fromEntries(api.headers) : api.headers) || {}),
            };

            // Add auth
            if (api.authType === 'bearer' && api.authConfig?.token) {
                headers['Authorization'] = `Bearer ${api.authConfig.token}`;
            } else if (api.authType === 'api_key' && api.authConfig?.key && api.authConfig?.headerName) {
                headers[api.authConfig.headerName as string] = api.authConfig.key as string;
            }

            // Make request
            const response = await fetch(url, {
                method: endpoint.method,
                headers,
                body: ['POST', 'PUT', 'PATCH'].includes(endpoint.method)
                    ? JSON.stringify(toolCall.arguments)
                    : undefined,
            });

            const duration = Date.now() - startTime;
            const result = await response.json();

            // Log API call
            await ApiCallLogModel.create({
                tenantId: context.tenantId,
                conversationId: context.conversationId,
                apiId: api._id,
                endpointId: endpoint.id,
                method: endpoint.method,
                url,
                statusCode: response.status,
                duration,
            });

            // Handle large results with pagination hint
            if (Array.isArray(result) && result.length > 20) {
                return {
                    toolCallId: toolCall.id,
                    name: toolCall.name,
                    result: {
                        items: result.slice(0, 20),
                        total: result.length,
                        message: `Showing first 20 of ${result.length} items. Ask for more if needed.`,
                    },
                    duration,
                };
            }

            return {
                toolCallId: toolCall.id,
                name: toolCall.name,
                result,
                duration,
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error(`Tool execution error for ${toolCall.name}:`, error);

            return {
                toolCallId: toolCall.id,
                name: toolCall.name,
                result: null,
                error: (error as Error).message,
                duration,
            };
        }
    }

    private async generateConversationTitle(
        tenantId: string,
        conversationId: string,
        firstMessage: string
    ): Promise<void> {
        try {
            const result = await this.aiService.generate(
                [
                    {
                        role: 'user',
                        content: `Generate a short title (max 6 words) for a conversation that starts with: "${firstMessage}". Reply with just the title, no quotes or extra text.`,
                    },
                ],
                { maxTokens: 50 }
            );

            if (result.content) {
                await conversationService.updateTitle(tenantId, conversationId, result.content.trim());
            }
        } catch (error) {
            logger.error('Failed to generate conversation title:', error);
        }
    }
}

export const chatService = new ChatService();
