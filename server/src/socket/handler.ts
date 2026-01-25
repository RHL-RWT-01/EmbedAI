import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { chatService, conversationService, tenantService } from '../services/index';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    SocketData,
} from '../types/index';
import { SOCKET_EVENTS } from '../types/index';
import { logger } from '../utils/logger';

export function setupSocketHandler(server: HTTPServer): Server {
    const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(server, {
        cors: {
            origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const apiKey = socket.handshake.auth.apiKey || socket.handshake.query.apiKey;

            if (!apiKey) {
                return next(new Error('API key required'));
            }

            const tenant = await tenantService.getByApiKey(apiKey as string);

            socket.data.tenantId = tenant.id;
            socket.data.sessionId = (socket.handshake.auth.sessionId || socket.handshake.query.sessionId) as string;

            if (!socket.data.sessionId) {
                return next(new Error('Session ID required'));
            }

            next();
        } catch (error) {
            logger.error('Socket authentication error:', error);
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Client connected: ${socket.id}, tenant: ${socket.data.tenantId}`);

        // Join tenant room
        socket.join(`tenant:${socket.data.tenantId}`);
        socket.join(`session:${socket.data.sessionId}`);

        // Handle chat messages
        socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data, callback) => {
            try {
                // Emit typing indicator
                socket.emit(SOCKET_EVENTS.TYPING_START);

                const result = await chatService.processMessage(data.message, {
                    tenantId: socket.data.tenantId!,
                    sessionId: socket.data.sessionId!,
                    userId: data.userId,
                    conversationId: data.conversationId,
                });

                socket.emit(SOCKET_EVENTS.TYPING_STOP);

                // Send response
                socket.emit(SOCKET_EVENTS.MESSAGE_RECEIVED, {
                    message: result.message,
                    conversationId: result.conversationId,
                    toolsExecuted: result.toolsExecuted?.length || 0,
                });

                if (callback) {
                    callback({ success: true, data: result });
                }
            } catch (error) {
                socket.emit(SOCKET_EVENTS.TYPING_STOP);

                logger.error('Socket message error:', error);

                socket.emit(SOCKET_EVENTS.ERROR, {
                    message: (error as Error).message || 'Failed to process message',
                });

                if (callback) {
                    callback({ success: false, error: (error as Error).message });
                }
            }
        });

        // Handle joining conversation
        socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, async (data) => {
            try {
                // Leave previous conversation room if any
                const rooms = Array.from(socket.rooms);
                rooms.forEach((room) => {
                    if (room.startsWith('conversation:')) {
                        socket.leave(room);
                    }
                });

                // Join new conversation room
                socket.join(`conversation:${data.conversationId}`);
                socket.data.conversationId = data.conversationId;

                // Send recent messages
                const messages = await conversationService.getRecentMessages(data.conversationId, 50);

                socket.emit(SOCKET_EVENTS.CONVERSATION_HISTORY, {
                    conversationId: data.conversationId,
                    messages,
                });
            } catch (error) {
                logger.error('Socket join conversation error:', error);
                socket.emit(SOCKET_EVENTS.ERROR, {
                    message: 'Failed to join conversation',
                });
            }
        });

        // Handle disconnect
        socket.on('disconnect', (reason) => {
            logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
        });
    });

    return io;
}
