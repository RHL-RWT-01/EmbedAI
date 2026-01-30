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
import { MessageSquare, Zap, Users, TrendingUp, Loader2, Server } from 'lucide-react';

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
    const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview(period);
    const { data: usage, isLoading: usageLoading } = useAnalyticsUsage(period);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-gray-400 mt-1">
                        Deep dive into your AI widget&apos;s performance metrics and usage patterns.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {(['day', 'week', 'month'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                                period === p
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
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
                        icon: <MessageSquare className="w-5 h-5" />,
                        color: 'blue',
                    },
                    {
                        label: 'Total Messages',
                        value: overview?.totalMessages || 0,
                        trend: overview?.messagesTrend,
                        icon: <TrendingUp className="w-5 h-5" />,
                        color: 'green',
                    },
                    {
                        label: 'API Calls',
                        value: overview?.totalApiCalls || 0,
                        trend: overview?.apiCallsTrend,
                        icon: <Zap className="w-5 h-5" />,
                        color: 'purple',
                    },
                    {
                        label: 'Active Users',
                        value: overview?.activeUsers || 0,
                        trend: overview?.usersTrend,
                        icon: <Users className="w-5 h-5" />,
                        color: 'orange',
                    },
                ].map((metric, i) => {
                    const colorClasses = {
                        blue: 'bg-blue-500/10 text-blue-400',
                        green: 'bg-emerald-500/10 text-emerald-400',
                        purple: 'bg-purple-500/10 text-purple-400',
                        orange: 'bg-orange-500/10 text-orange-400',
                    };
                    return (
                        <div key={i} className="bg-zinc-900 rounded-xl p-5 shadow-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <span className={cn('p-2 rounded-lg', colorClasses[metric.color as keyof typeof colorClasses])}>
                                    {metric.icon}
                                </span>
                                {metric.trend !== undefined && (
                                    <span
                                        className={cn(
                                            'text-xs font-medium px-2 py-0.5 rounded',
                                            metric.trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                        )}
                                    >
                                        {formatPercent(metric.trend)}
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-white">{formatNumber(metric.value)}</p>
                            <p className="text-sm text-gray-400 mt-1">{metric.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Over Time */}
                <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
                    <h2 className="text-lg font-semibold text-white mb-4">Activity Over Time</h2>
                    {usageLoading ? (
                        <div className="h-72 flex items-center justify-center">
                            <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
                        </div>
                    ) : (
                        <>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={usage?.dailyStats || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12, fill: '#a1a1aa' }}
                                            tickFormatter={(value) =>
                                                new Date(value).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                            }
                                        />
                                        <YAxis tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#27272a',
                                                border: '1px solid #3f3f46',
                                                borderRadius: '8px',
                                                color: '#fff',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="messages"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: '#10b981' }}
                                            name="Messages"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="conversations"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: '#6366f1' }}
                                            name="Conversations"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-sm text-gray-400">Messages</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                    <span className="text-sm text-gray-400">Conversations</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Top APIs */}
                <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
                    <h2 className="text-lg font-semibold text-white mb-4">API Usage</h2>
                    {usageLoading ? (
                        <div className="h-72 flex items-center justify-center">
                            <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
                        </div>
                    ) : usage?.topApis && usage.topApis.length > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={usage.topApis} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                                    <XAxis type="number" tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 12, fill: '#a1a1aa' }}
                                        width={100}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#27272a',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '8px',
                                            color: '#fff',
                                        }}
                                        formatter={(value: number | undefined, name: string | undefined) => [
                                            name === 'calls' ? `${value ?? 0} calls` : `${(value ?? 0).toFixed(1)}%`,
                                            name === 'calls' ? 'Total Calls' : 'Success Rate',
                                        ]}
                                    />
                                    <Bar dataKey="calls" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex flex-col items-center justify-center text-gray-500">
                            <Server className="w-12 h-12 mb-3 text-gray-600" />
                            <p>No API usage data yet</p>
                            <p className="text-sm text-gray-600 mt-1">Connect APIs to see usage stats</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
                <h2 className="text-lg font-semibold text-white mb-4">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
                        <p className="text-3xl font-bold text-emerald-400">
                            {overview?.avgResponseTime?.toFixed(2) || '0.00'}s
                        </p>
                        <p className="text-sm text-gray-400 mt-2">Avg Response Time</p>
                    </div>
                    <div className="text-center p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
                        <p className="text-3xl font-bold text-blue-400">
                            {overview?.avgMessagesPerConversation?.toFixed(1) || '0.0'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">Avg Messages/Conversation</p>
                    </div>
                    <div className="text-center p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
                        <p className="text-3xl font-bold text-purple-400">
                            {overview?.totalApiCalls && overview?.totalMessages
                                ? ((overview.totalApiCalls / overview.totalMessages) * 100).toFixed(1)
                                : '0.0'}
                            %
                        </p>
                        <p className="text-sm text-gray-400 mt-2">API Call Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
