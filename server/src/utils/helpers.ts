import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return uuidv4();
}

/**
 * Generate a short ID (8 characters)
 */
export function generateShortId(): string {
    return uuidv4().replace(/-/g, '').substring(0, 8);
}

/**
 * Generate an API key
 */
export function generateApiKey(prefix = 'ue'): string {
    const key = crypto.randomBytes(24).toString('base64url');
    return `${prefix}_${key}`;
}

/**
 * Hash a string using SHA256
 */
export function hashString(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Encrypt a string
 */
export function encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(key.padEnd(32, '0').slice(0, 32)),
        iv
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a string
 */
export function decrypt(encryptedText: string, key: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(key.padEnd(32, '0').slice(0, 32)),
        iv
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Truncate string
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

/**
 * Custom AppError class
 */
export class AppError extends Error {
    public statusCode: number;
    public code: string;
    public isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR'
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Pick specific keys from an object
 */
export function pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    keys.forEach((key) => {
        delete result[key];
    });
    return result as Omit<T, K>;
}

/**
 * Parse pagination parameters
 */
export function parsePagination(
    page?: string | number,
    limit?: string | number
): { page: number; limit: number; skip: number } {
    const parsedPage = Math.max(1, parseInt(String(page || 1), 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit || 20), 10)));
    return {
        page: parsedPage,
        limit: parsedLimit,
        skip: (parsedPage - 1) * parsedLimit,
    };
}
