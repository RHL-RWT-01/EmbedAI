import { Content, FunctionDeclaration, GoogleGenerativeAI, Part, Tool } from '@google/generative-ai';
import type { AIGenerateOptions, AIGenerateResult, AIMessage, AITool, ToolCall } from '../types/index';
import { AI_CONFIG } from '../types/index';
import { logger } from '../utils/logger';
import { BaseAIProvider } from './base-provider.js';

export class GeminiProvider extends BaseAIProvider {
    private client: GoogleGenerativeAI;

    constructor(apiKey: string) {
        super('gemini', apiKey);
        this.client = new GoogleGenerativeAI(apiKey);
    }

    async generate(messages: AIMessage[], options?: AIGenerateOptions): Promise<AIGenerateResult> {
        const model = this.client.getGenerativeModel({
            model: options?.model || AI_CONFIG.GEMINI.DEFAULT_MODEL,
            systemInstruction: this.buildSystemPrompt(options?.systemPrompt),
        });

        const contents = this.convertMessages(messages);
        const tools = options?.tools ? this.formatTools(options.tools) : undefined;

        try {
            const result = await model.generateContent({
                contents,
                generationConfig: {
                    temperature: options?.temperature ?? AI_CONFIG.GEMINI.TEMPERATURE,
                    maxOutputTokens: options?.maxTokens ?? AI_CONFIG.GEMINI.MAX_TOKENS,
                },
                tools,
            });

            const response = result.response;
            const candidate = response.candidates?.[0];

            if (!candidate) {
                throw new Error('No response generated');
            }

            const toolCalls = this.extractToolCalls(candidate.content);
            const content = this.extractTextContent(candidate.content);

            return {
                content: content || '',
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                usage: {
                    inputTokens: response.usageMetadata?.promptTokenCount || 0,
                    outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: response.usageMetadata?.totalTokenCount || 0,
                },
                finishReason: toolCalls.length > 0 ? 'tool_calls' : 'stop',
            };
        } catch (error) {
            logger.error('Gemini generation error:', error);
            throw error;
        }
    }

    private convertMessages(messages: AIMessage[]): Content[] {
        return messages
            .filter((m) => m.role !== 'system')
            .map((message) => {
                const parts: Part[] = [];

                if (message.content) {
                    parts.push({ text: message.content });
                }

                if (message.toolResults) {
                    message.toolResults.forEach((result) => {
                        parts.push({
                            functionResponse: {
                                name: result.name,
                                response: { result: result.result },
                            },
                        });
                    });
                }

                return {
                    role: message.role === 'assistant' ? 'model' : 'user',
                    parts,
                };
            });
    }

    private formatTools(tools: AITool[]): Tool[] {
        const functionDeclarations: FunctionDeclaration[] = tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters as FunctionDeclaration['parameters'],
        }));

        return [{ functionDeclarations }];
    }

    private extractToolCalls(content: Content): ToolCall[] {
        const toolCalls: ToolCall[] = [];

        content.parts?.forEach((part) => {
            if ('functionCall' in part && part.functionCall) {
                toolCalls.push({
                    id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: part.functionCall.name,
                    arguments: (part.functionCall.args as Record<string, unknown>) || {},
                });
            }
        });

        return toolCalls;
    }

    private extractTextContent(content: Content): string {
        return (
            content.parts
                ?.filter((part) => 'text' in part)
                .map((part) => (part as { text: string }).text)
                .join('') || ''
        );
    }
}
