import mongoose from 'mongoose';
import { ApiCallLogModel, ConversationModel, MessageModel } from '../database/index';

export class AnalyticsService {
    async getOverview(tenantId: string, period: 'day' | 'week' | 'month' = 'week') {
        const startDate = this.getStartDate(period);
        const previousStartDate = this.getPreviousStartDate(period);

        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

        // Current period stats
        const [conversations, messages, apiCalls, activeUsers] = await Promise.all([
            ConversationModel.countDocuments({
                tenantId: tenantObjectId,
                createdAt: { $gte: startDate },
            }),
            MessageModel.countDocuments({
                conversationId: {
                    $in: await ConversationModel.find({ tenantId: tenantObjectId }).distinct('_id'),
                },
                createdAt: { $gte: startDate },
            }),
            ApiCallLogModel.countDocuments({
                tenantId: tenantObjectId,
                createdAt: { $gte: startDate },
            }),
            ConversationModel.distinct('sessionId', {
                tenantId: tenantObjectId,
                createdAt: { $gte: startDate },
            }).then((sessions) => sessions.length),
        ]);

        // Previous period stats for trends
        const [prevConversations, prevMessages, prevApiCalls, prevActiveUsers] = await Promise.all([
            ConversationModel.countDocuments({
                tenantId: tenantObjectId,
                createdAt: { $gte: previousStartDate, $lt: startDate },
            }),
            MessageModel.countDocuments({
                conversationId: {
                    $in: await ConversationModel.find({ tenantId: tenantObjectId }).distinct('_id'),
                },
                createdAt: { $gte: previousStartDate, $lt: startDate },
            }),
            ApiCallLogModel.countDocuments({
                tenantId: tenantObjectId,
                createdAt: { $gte: previousStartDate, $lt: startDate },
            }),
            ConversationModel.distinct('sessionId', {
                tenantId: tenantObjectId,
                createdAt: { $gte: previousStartDate, $lt: startDate },
            }).then((sessions) => sessions.length),
        ]);

        // Calculate response time
        const avgResponseTime = await ApiCallLogModel.aggregate([
            { $match: { tenantId: tenantObjectId, createdAt: { $gte: startDate } } },
            { $group: { _id: null, avg: { $avg: '$duration' } } },
        ]).then((result) => (result[0]?.avg || 0) / 1000);

        // Messages per conversation
        const avgMessagesPerConversation = conversations > 0 ? messages / conversations : 0;

        return {
            totalConversations: conversations,
            totalMessages: messages,
            totalApiCalls: apiCalls,
            activeUsers,
            avgResponseTime,
            avgMessagesPerConversation,
            conversationsTrend: this.calculateTrend(conversations, prevConversations),
            messagesTrend: this.calculateTrend(messages, prevMessages),
            apiCallsTrend: this.calculateTrend(apiCalls, prevApiCalls),
            usersTrend: this.calculateTrend(activeUsers, prevActiveUsers),
        };
    }

    async getUsage(tenantId: string, period: 'day' | 'week' | 'month' = 'week') {
        const startDate = this.getStartDate(period);
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

        // Daily stats
        const dailyStats = await ConversationModel.aggregate([
            {
                $match: {
                    tenantId: tenantObjectId,
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    conversations: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Get message counts per day
        const conversationIds = await ConversationModel.find({ tenantId: tenantObjectId }).distinct('_id');

        const dailyMessages = await MessageModel.aggregate([
            {
                $match: {
                    conversationId: { $in: conversationIds },
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    messages: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Top APIs
        const topApis = await ApiCallLogModel.aggregate([
            {
                $match: {
                    tenantId: tenantObjectId,
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: '$apiId',
                    calls: { $sum: 1 },
                    successes: {
                        $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] },
                    },
                },
            },
            {
                $lookup: {
                    from: 'registeredapis',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'api',
                },
            },
            { $unwind: '$api' },
            {
                $project: {
                    name: '$api.name',
                    calls: 1,
                    successRate: {
                        $multiply: [{ $divide: ['$successes', '$calls'] }, 100],
                    },
                },
            },
            { $sort: { calls: -1 } },
            { $limit: 10 },
        ]);

        // Merge daily stats
        const messagesMap = new Map(dailyMessages.map((d) => [d._id, d.messages]));
        const mergedDailyStats = dailyStats.map((day) => ({
            date: day._id,
            conversations: day.conversations,
            messages: messagesMap.get(day._id) || 0,
            apiCalls: 0, // Would need another aggregation
        }));

        return {
            dailyStats: mergedDailyStats,
            topApis,
        };
    }

    private getStartDate(period: 'day' | 'week' | 'month'): Date {
        const now = new Date();
        switch (period) {
            case 'day':
                return new Date(now.setDate(now.getDate() - 1));
            case 'week':
                return new Date(now.setDate(now.getDate() - 7));
            case 'month':
                return new Date(now.setMonth(now.getMonth() - 1));
        }
    }

    private getPreviousStartDate(period: 'day' | 'week' | 'month'): Date {
        const now = new Date();
        switch (period) {
            case 'day':
                return new Date(now.setDate(now.getDate() - 2));
            case 'week':
                return new Date(now.setDate(now.getDate() - 14));
            case 'month':
                return new Date(now.setMonth(now.getMonth() - 2));
        }
    }

    private calculateTrend(current: number, previous: number): number {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    }
}

export const analyticsService = new AnalyticsService();
