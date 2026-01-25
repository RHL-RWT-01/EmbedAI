import type { AIGenerateOptions, AIGenerateResult, AIMessage, AITool } from '../types/index';

export abstract class BaseAIProvider {
    protected name: string;
    protected apiKey: string;

    constructor(name: string, apiKey: string) {
        this.name = name;
        this.apiKey = apiKey;
    }

    abstract generate(
        messages: AIMessage[],
        options?: AIGenerateOptions
    ): Promise<AIGenerateResult>;

    getName(): string {
        return this.name;
    }

    protected buildSystemPrompt(customPrompt?: string): string {
        const basePrompt = `You are UseEmbed, an intelligent AI assistant embedded in a software product. 
Your role is to help users accomplish tasks by understanding their requests and executing the appropriate actions through available APIs.

Guidelines:
1. Be helpful, concise, and accurate
2. When users ask to perform actions, use the available tools/functions
3. If you need more information to complete a task, ask clarifying questions
4. Always explain what actions you're taking
5. Handle errors gracefully and suggest alternatives
6. Respect user privacy and data security`;

        return customPrompt ? `${basePrompt}\n\n${customPrompt}` : basePrompt;
    }

    protected formatToolsForProvider(tools: AITool[]): unknown {
        return tools;
    }
}
