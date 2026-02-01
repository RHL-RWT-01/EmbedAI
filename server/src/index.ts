import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import config from './config/index.js';
import { connectDatabase } from './database/connection.js';
import { apiLimiter, errorHandler, notFoundHandler } from './middleware/index.js';
import {
    analyticsRoutes,
    apiRoutes,
    authRoutes,
    conversationRoutes,
    tenantRoutes,
    widgetRoutes,
} from './routes/index.js';
import { setupSocketHandler } from './socket/index.js';
import { logger } from './utils/logger.js';
import { isRedisEnabled } from './utils/redis.js';

async function bootstrap(): Promise<void> {
    // Create Express app
    const app = express();
    const server = createServer(app);

    // Setup Socket.io
    const io = setupSocketHandler(server);

    // Security middleware
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    }));

    // CORS
    const corsOrigins = config.CORS_ORIGIN.split(',').map((o: string) => o.trim());
    app.use(cors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    }));

    // Compression
    app.use(compression());

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.info({
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration: `${duration}ms`,
                userAgent: req.headers['user-agent'],
            });
        });
        next();
    });

    // Health check
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
        });
    });

    // Rate limiting for API routes
    app.use('/api', apiLimiter);

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/tenants', tenantRoutes);
    app.use('/api/apis', apiRoutes);
    app.use('/api/conversations', conversationRoutes);
    app.use('/api/analytics', analyticsRoutes);

    // Widget routes (public with API key auth)
    app.use('/widget', widgetRoutes);

    // Error handlers
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Connect to database
    await connectDatabase();

    // Start server
    server.listen(config.PORT, () => {
        logger.info(`Embed Server running at http://localhost:${config.PORT}`);
        logger.info(`Environment: ${config.NODE_ENV}`);
        logger.info(`Redis: ${isRedisEnabled() ? 'enabled' : 'disabled (using in-memory rate limiting)'}`);
        logger.info(`WebSocket server ready`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
        logger.info(`\n${signal} received. Shutting down gracefully...`);

        server.close(async () => {
            logger.info('HTTP server closed');
            process.exit(0);
        });

        // Force close after 10 seconds
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
});
