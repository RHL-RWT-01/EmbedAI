'use client';

import { useAnalyticsOverview, useAnalyticsUsage } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';
import { cn, formatNumber, formatPercent } from '@/lib/utils';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { TrendingUp, MessageSquare, Zap, Users, Loader2, Server, Sparkles } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    trend?: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, trend, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/10',
        green: 'bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10',
        purple: 'bg-purple-500/10 text-purple-400 shadow-lg shadow-purple-500/10',
        orange: 'bg-orange-500/10 text-orange-400 shadow-lg shadow-orange-500/10',
    };

    return (
        <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-lg', colorClasses[color])}>{icon}</div>
                {trend !== undefined && (
                    <span
                        className={cn(
                            'text-sm font-medium px-2 py-1 rounded',
                            trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        )}
                    >
                        {formatPercent(trend)}
                    </span>
                )}
            </div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-white mt-1">
                {typeof value === 'number' ? formatNumber(value) : value}
            </p>
        </div>
    );
}

export default function DashboardPage() {
    const { tenant } = useAuthStore();
    const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview('week');
    const { data: usage, isLoading: usageLoading } = useAnalyticsUsage('week');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 mt-1">
                        Welcome back! Here&apos;s what&apos;s happening with your AI widget.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">API Key:</span>
                    <code className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm font-mono text-emerald-400 border border-zinc-700">
                        {tenant?.apiKey?.slice(0, 15)}...
                    </code>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Conversations"
                    value={overview?.totalConversations || 0}
                    trend={overview?.conversationsTrend}
                    color="blue"
                    icon={<TrendingUp className="w-6 h-6" />}
                />
                <StatCard
                    title="Total Messages"
                    value={overview?.totalMessages || 0}
                    trend={overview?.messagesTrend}
                    color="green"
                    icon={<MessageSquare className="w-6 h-6" />}
                />
                <StatCard
                    title="API Calls"
                    value={overview?.totalApiCalls || 0}
                    trend={overview?.apiCallsTrend}
                    color="purple"
                    icon={<Zap className="w-6 h-6" />}
                />
                <StatCard
                    title="Active Users"
                    value={overview?.activeUsers || 0}
                    trend={overview?.usersTrend}
                    color="orange"
                    icon={<Users className="w-6 h-6" />}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
                    <h2 className="text-lg font-semibold text-white mb-4">Activity Overview</h2>
                    {usageLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
                        </div>
                    ) : (
                        <div className="h-64">
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
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="conversations"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
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
                </div>

                {/* Top APIs Chart */}
                <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
                    <h2 className="text-lg font-semibold text-white mb-4">Top APIs by Usage</h2>
                    {usageLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
                        </div>
                    ) : usage?.topApis && usage.topApis.length > 0 ? (
                        <div className="h-64">
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
                                    />
                                    <Bar dataKey="calls" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                            <Server className="w-12 h-12 mb-3" />
                            <p>No API usage data yet</p>
                            <p className="text-sm">Connect your first API to see stats</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Avg Response Time</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                {overview?.avgResponseTime?.toFixed(2) || '0.00'}s
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Avg Messages/Conversation</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                {overview?.avgMessagesPerConversation?.toFixed(1) || '0.0'}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">AI Provider</p>
                            <p className="text-2xl font-bold text-white mt-1 capitalize">
                                {(tenant?.settings as { aiProvider?: string })?.aiProvider || 'Gemini'}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                            <Zap className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Setup Guide */}
            <div className="bg-zinc-900 rounded-xl p-8 shadow-xl border border-zinc-800 border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Get Started with the SDK</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">1. Install</h3>
                        <div className="relative group">
                            <pre className="bg-black/50 rounded-lg p-4 font-mono text-sm text-emerald-400 overflow-x-auto border border-zinc-700">
                                <code>npm install useembed-sdk</code>
                            </pre>
                        </div>

                        <h3 className="text-lg font-semibold text-white mt-6">2. Configure</h3>
                        <p className="text-gray-400 text-sm">
                            Add the widget to your React app for an instant AI assistant.
                        </p>
                        <div className="relative group">
                            <pre className="bg-black/50 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto border border-zinc-700">
                                <code>{`import { ChatWidget } from 'useembed-sdk/react';

function App() {
  return (
    <ChatWidget 
      apiKey="${tenant?.apiKey || 'YOUR_API_KEY'}"
      agentName="${(tenant?.settings as any)?.agentName || 'AI Assistant'}"
      greeting="${(tenant?.settings as any)?.greeting || 'Hello!'}"
    />
  );
}`}</code>
                            </pre>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Vanilla JavaScript</h3>
                        <p className="text-gray-400 text-sm">
                            Use our client directly for custom integrations.
                        </p>
                        <div className="relative group">
                            <pre className="bg-black/50 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto border border-zinc-700">
                                <code>{`import { createClient } from 'useembed-sdk';

const client = createClient({
  apiKey: '${tenant?.apiKey || 'YOUR_API_KEY'}',
});

await client.init();
const response = await client.sendMessage('Hello!');`}</code>
                            </pre>
                        </div>

                        <div className="bg-emerald-500/5 rounded-xl p-6 border border-emerald-500/20 mt-6">
                            <h4 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Pro Tip
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Go to <strong>Settings</strong> to customize your agent&apos;s knowledge context.
                                The more info you provide, the better it can help your users!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
