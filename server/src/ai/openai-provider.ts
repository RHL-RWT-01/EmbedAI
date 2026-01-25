import OpenAI from 'openai';
import type { AIGenerateOptions, AIGenerateResult, AIMessage, AITool, ToolCall } from '../types/index';
import { AI_CONFIG } from '../types/index';
import { logger } from '../utils/logger';
import { BaseAIProvider } from './base-provider.js';

export class OpenAIProvider extends BaseAIProvider {
    private client: OpenAI;

    constructor(apiKey: string) {
        super('openai', apiKey);
        this.client = new OpenAI({ apiKey });
    }

    async generate(messages: AIMessage[], options?: AIGenerateOptions): Promise<AIGenerateResult> {
        const formattedMessages = this.formatMessages(messages, options?.systemPrompt);
        const tools = options?.tools ? this.formatTools(options.tools) : undefined;

        try {
            const response = await this.client.chat.completions.create({
                model: options?.model || AI_CONFIG.OPENAI.DEFAULT_MODEL,
                messages: formattedMessages,
                temperature: options?.temperature ?? AI_CONFIG.OPENAI.TEMPERATURE,
                max_tokens: options?.maxTokens ?? AI_CONFIG.OPENAI.MAX_TOKENS,
                tools,
            });

            const choice = response.choices[0];

            if (!choice) {
                throw new Error('No response generated');
            }

            const toolCalls = this.extractToolCalls(choice.message);

            return {
                content: choice.message.content || '',
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                usage: {
                    inputTokens: response.usage?.prompt_tokens || 0,
                    outputTokens: response.usage?.completion_tokens || 0,
                    totalTokens: response.usage?.total_tokens || 0,
                },
                finishReason: choice.finish_reason === 'tool_calls' ? 'tool_calls' : 'stop',
            };
        } catch (error) {
            logger.error('OpenAI generation error:', error);
            throw error;
        }
    }

    private formatMessages(
        messages: AIMessage[],
        systemPrompt?: string
    ): OpenAI.Chat.ChatCompletionMessageParam[] {
        const formatted: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: this.buildSystemPrompt(systemPrompt) },
        ];

        messages.forEach((message) => {
            if (message.role === 'system') return;

            if (message.role === 'user') {
                formatted.push({ role: 'user', content: message.content });
            } else if (message.role === 'assistant') {
                const assistantMessage: OpenAI.Chat.ChatCompletionAssistantMessageParam = {
                    role: 'assistant',
                    content: message.content || null,
                };

                if (message.toolCalls && message.toolCalls.length > 0) {
                    assistantMessage.tool_calls = message.toolCalls.map((tc) => ({
                        id: tc.id,
                        type: 'function' as const,
                        function: {
                            name: tc.name,
                            arguments: JSON.stringify(tc.arguments),
                        },
                    }));
                }

                formatted.push(assistantMessage);
            } else if (message.role === 'tool' && message.toolResults) {
                message.toolResults.forEach((result) => {
                    formatted.push({
                        role: 'tool',
                        tool_call_id: result.toolCallId,
                        content: JSON.stringify(result.result),
                    });
                });
            }
        });

        return formatted;
    }

    private formatTools(tools: AITool[]): OpenAI.Chat.ChatCompletionTool[] {
        return tools.map((tool) => ({
            type: 'function' as const,
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
            },
        }));
    }

    private extractToolCalls(
        message: OpenAI.Chat.ChatCompletionMessage
    ): ToolCall[] {
        if (!message.tool_calls) return [];

        return message.tool_calls.map((tc) => ({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments || '{}'),
        }));
    }
}
