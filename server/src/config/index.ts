import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('4000'),

    // MongoDB
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

    // Redis
    REDIS_URL: z.string().default('redis://localhost:6379'),

    // JWT
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Encryption
    ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),

    // AI
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
    OPENAI_API_KEY: z.string().optional(),

    // CORS
    CORS_ORIGIN: z.string().default('http://localhost:3000'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

function validateEnv() {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missing = error.errors.map((e) => e.path.join('.')).join(', ');
            console.error(`❌ Invalid environment variables: ${missing}`);
            process.exit(1);
        }
        throw error;
    }
}

export const config = validateEnv();

export default config;
