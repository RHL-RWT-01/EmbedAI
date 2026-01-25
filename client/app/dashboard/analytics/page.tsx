'use client';

import { useAnalyticsOverview, useAnalyticsUsage } from '@/lib/hooks';
import { cn, formatNumber, formatPercent } from '@/lib/utils';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const COLORS = ['#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
    const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview(period);
    const { data: usage, isLoading: usageLoading } = useAnalyticsUsage(period);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 mt-1">
                        Monitor your AI widget&apos;s performance and usage.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {(['day', 'week', 'month'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                                period === p
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            )}
                        >
                            {p === 'day' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total Conversations',
                        value: overview?.totalConversations || 0,
                        trend: overview?.conversationsTrend,
                        icon: (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        ),
                    },
                    {
                        label: 'Total Messages',
                        value: overview?.totalMessages || 0,
                        trend: overview?.messagesTrend,
                        icon: (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                        ),
                    },
                    {
                        label: 'API Calls',
                        value: overview?.totalApiCalls || 0,
                        trend: overview?.apiCallsTrend,
                        icon: (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        ),
                    },
                    {
                        label: 'Active Users',
                        value: overview?.activeUsers || 0,
                        trend: overview?.usersTrend,
                        icon: (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ),
                    },
                ].map((metric, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400">{metric.icon}</span>
                            {metric.trend !== undefined && (
                                <span
                                    className={cn(
                                        'text-xs font-medium px-2 py-0.5 rounded',
                                        metric.trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    )}
                                >
                                    {formatPercent(metric.trend)}
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(metric.value)}</p>
                        <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Over Time */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Over Time</h2>
                    {usageLoading ? (
                        <div className="h-72 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                        </div>
                    ) : (
                        <>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={usage?.dailyStats || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickFormatter={(value) =>
                                                new Date(value).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                            }
                                        />
                                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="messages"
                                            stroke="#0ea5e9"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            name="Messages"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="conversations"
                                            stroke="#d946ef"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            name="Conversations"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                                    <span className="text-sm text-gray-600">Messages</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-accent-500"></div>
                                    <span className="text-sm text-gray-600">Conversations</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Top APIs */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">API Usage</h2>
                    {usageLoading ? (
                        <div className="h-72 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                        </div>
                    ) : usage?.topApis && usage.topApis.length > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={usage.topApis} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        width={100}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value: number | undefined, name: string | undefined) => [
                                            name === 'calls' ? `${value ?? 0} calls` : `${(value ?? 0).toFixed(1)}%`,
                                            name === 'calls' ? 'Total Calls' : 'Success Rate',
                                        ]}
                                    />
                                    <Bar dataKey="calls" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            <p>No API usage data yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-gray-900">
                            {overview?.avgResponseTime?.toFixed(2) || '0.00'}s
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Avg Response Time</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-gray-900">
                            {overview?.avgMessagesPerConversation?.toFixed(1) || '0.0'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Avg Messages/Conversation</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-gray-900">
                            {overview?.totalApiCalls && overview?.totalMessages
                                ? ((overview.totalApiCalls / overview.totalMessages) * 100).toFixed(1)
                                : '0.0'}
                            %
                        </p>
                        <p className="text-sm text-gray-500 mt-1">API Call Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
