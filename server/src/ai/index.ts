import config from '../config/index';
import type { AIGenerateOptions, AIGenerateResult, AIMessage } from '../types/index';
import { AI_CONFIG } from '../types/index';
import { sleep } from '../utils/helpers';
import { logger } from '../utils/logger';
import { BaseAIProvider } from './base-provider.js';
import { GeminiProvider } from './gemini-provider.js';
import { OpenAIProvider } from './openai-provider.js';

export class AIService {
    private primaryProvider: BaseAIProvider;
    private fallbackProvider: BaseAIProvider | null;

    constructor() {
        this.primaryProvider = new GeminiProvider(config.GEMINI_API_KEY);
        this.fallbackProvider = config.OPENAI_API_KEY
            ? new OpenAIProvider(config.OPENAI_API_KEY)
            : null;
    }

    async generate(
        messages: AIMessage[],
        options?: AIGenerateOptions
    ): Promise<AIGenerateResult> {
        let lastError: Error | null = null;

        // Try primary provider with retries
        for (let attempt = 0; attempt < AI_CONFIG.MAX_RETRIES; attempt++) {
            try {
                logger.debug(`AI generation attempt ${attempt + 1} with ${this.primaryProvider.getName()}`);
                return await this.primaryProvider.generate(messages, options);
            } catch (error) {
                lastError = error as Error;
                logger.warn(`Primary provider failed (attempt ${attempt + 1}):`, error);

                if (attempt < AI_CONFIG.MAX_RETRIES - 1) {
                    await sleep(AI_CONFIG.RETRY_DELAY * Math.pow(2, attempt));
                }
            }
        }

        // Try fallback provider
        if (this.fallbackProvider) {
            logger.info('Switching to fallback AI provider');

            for (let attempt = 0; attempt < AI_CONFIG.MAX_RETRIES; attempt++) {
                try {
                    logger.debug(`Fallback attempt ${attempt + 1} with ${this.fallbackProvider.getName()}`);
                    return await this.fallbackProvider.generate(messages, options);
                } catch (error) {
                    lastError = error as Error;
                    logger.warn(`Fallback provider failed (attempt ${attempt + 1}):`, error);

                    if (attempt < AI_CONFIG.MAX_RETRIES - 1) {
                        await sleep(AI_CONFIG.RETRY_DELAY * Math.pow(2, attempt));
                    }
                }
            }
        }

        throw lastError || new Error('AI generation failed');
    }

    getPrimaryProviderName(): string {
        return this.primaryProvider.getName();
    }

    hasFallback(): boolean {
        return this.fallbackProvider !== null;
    }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
    if (!aiServiceInstance) {
        aiServiceInstance = new AIService();
    }
    return aiServiceInstance;
}

export { BaseAIProvider, GeminiProvider, OpenAIProvider };
