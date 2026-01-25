'use client';

import apiClient from '@/lib/api';
import { useApis } from '@/lib/hooks';
import { cn, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Loader2, Link as LinkIcon, Zap, Clock, Play, Pause, Edit, Trash2, Server } from 'lucide-react';

export default function ApisPage() {
    const { data, isLoading, mutate } = useApis();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleDeleteApi = async (id: string) => {
        if (!confirm('Are you sure you want to delete this API?')) return;

        try {
            await apiClient.deleteApi(id);
            toast.success('API deleted successfully');
            mutate();
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete API');
        }
    };

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            await apiClient.updateApi(id, { isActive: !isActive });
            toast.success(isActive ? 'API disabled' : 'API enabled');
            mutate();
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update API');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">APIs</h1>
                    <p className="text-gray-400 mt-1">
                        Connect your APIs to let the AI assistant interact with them.
                    </p>
                </div>
                <Link
                    href="/dashboard/apis/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Add API
                </Link>
            </div>

            {/* API List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
                </div>
            ) : data?.items && data.items.length > 0 ? (
                <div className="grid gap-4">
                    {data.items.map((api) => (
                        <div
                            key={api.id}
                            className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800 hover:border-zinc-700 transition-all transform hover:scale-[1.01]"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/dashboard/apis/${api.id}`}
                                            className="text-lg font-semibold text-white hover:text-emerald-500 transition-colors"
                                        >
                                            {api.name}
                                        </Link>
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                                api.isActive
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-zinc-700 text-gray-400'
                                            )}
                                        >
                                            {api.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {api.description && (
                                        <p className="text-gray-400 mt-1 text-sm">{api.description}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                                        <span className="inline-flex items-center gap-1.5">
                                            <LinkIcon className="w-4 h-4" />
                                            {api.baseUrl}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Zap className="w-4 h-4" />
                                            {(api.endpoints as unknown[])?.length || 0} endpoints
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {formatRelativeTime(api.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(api.id, api.isActive)}
                                        className={cn(
                                            'p-2 rounded-lg transition-all transform hover:scale-110',
                                            api.isActive
                                                ? 'text-yellow-400 hover:bg-yellow-500/10'
                                                : 'text-emerald-400 hover:bg-emerald-500/10'
                                        )}
                                        title={api.isActive ? 'Disable' : 'Enable'}
                                    >
                                        {api.isActive ? (
                                            <Pause className="w-5 h-5" />
                                        ) : (
                                            <Play className="w-5 h-5" />
                                        )}
                                    </button>
                                    <Link
                                        href={`/dashboard/apis/${api.id}`}
                                        className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-zinc-800 rounded-lg transition-all transform hover:scale-110"
                                        title="Edit"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteApi(api.id)}
                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all transform hover:scale-110"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-zinc-900 rounded-xl p-12 shadow-xl border border-zinc-800 text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Server className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">No APIs connected</h3>
                    <p className="text-gray-400 mt-1 mb-6">
                        Connect your first API to enable AI-powered interactions.
                    </p>
                    <Link
                        href="/dashboard/apis/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add your first API
                    </Link>
                </div>
            )}
        </div>
    );
}
