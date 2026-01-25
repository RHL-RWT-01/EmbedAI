import mongoose from 'mongoose';
import config from '../config/index';
import { logger } from '../utils/logger';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
    if (isConnected) {
        logger.info('Using existing database connection');
        return;
    }

    try {
        const conn = await mongoose.connect(config.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        logger.info(`MongoDB connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            isConnected = false;
            logger.warn('MongoDB disconnected');
        });
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
}

export async function disconnectDatabase(): Promise<void> {
    if (!isConnected) return;

    try {
        await mongoose.disconnect();
        isConnected = false;
        logger.info('MongoDB disconnected');
    } catch (error) {
        logger.error('MongoDB disconnection error:', error);
        throw error;
    }
}

export { mongoose };
