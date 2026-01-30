'use client';

import apiClient from '@/lib/api';
import { useConversationMessages, useConversations } from '@/lib/hooks';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare, Trash2, Loader2 } from 'lucide-react';

export default function ConversationsPage() {
    const { data, isLoading, mutate } = useConversations({ limit: 20 });
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { data: messagesData, isLoading: messagesLoading } = useConversationMessages(selectedId);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            await apiClient.deleteConversation(id);
            toast.success('Conversation deleted');
            if (selectedId === id) setSelectedId(null);
            mutate();
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete conversation');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Conversations</h1>
                <p className="text-gray-400 mt-1">
                    View and manage all chat conversations from your widget.
                </p>
            </div>

            {/* Content */}
            <div className="flex h-[calc(100vh-14rem)] gap-6">
                {/* Conversation List */}
                <div className="w-80 flex-shrink-0 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 flex flex-col">
                    <div className="p-4 border-b border-zinc-800">
                        <h2 className="font-semibold text-white">All Conversations</h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {data?.pagination?.total || 0} total
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin h-6 w-6 text-emerald-500" />
                            </div>
                        ) : data?.items && data.items.length > 0 ? (
                            <div className="divide-y divide-zinc-800">
                                {data.items.map((conv) => (
                                    <div
                                        key={conv.id}
                                        className={cn(
                                            'p-4 cursor-pointer transition-all',
                                            selectedId === conv.id
                                                ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500'
                                                : 'hover:bg-zinc-800/50'
                                        )}
                                        onClick={() => setSelectedId(conv.id)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white truncate">
                                                    {conv.title || 'Untitled conversation'}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-0.5">
                                                    {conv.messageCount} messages
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-500">
                                                    {formatRelativeTime(conv.lastMessageAt || conv.createdAt)}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(conv.id);
                                                    }}
                                                    className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-500" />
                                </div>
                                <p className="text-gray-400">No conversations yet</p>
                                <p className="text-sm text-gray-500 mt-1">Start chatting with your widget</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 flex flex-col">
                    {selectedId ? (
                        <>
                            <div className="p-4 border-b border-zinc-800">
                                <h2 className="font-semibold text-white">
                                    {data?.items?.find((c) => c.id === selectedId)?.title || 'Conversation'}
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messagesLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="animate-spin h-6 w-6 text-emerald-500" />
                                    </div>
                                ) : messagesData?.items && messagesData.items.length > 0 ? (
                                    messagesData.items.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                'flex',
                                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[70%] rounded-2xl px-4 py-3',
                                                    msg.role === 'user'
                                                        ? 'bg-emerald-600 text-white rounded-br-md'
                                                        : 'bg-zinc-800 text-gray-200 rounded-bl-md'
                                                )}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                {msg.toolCalls && msg.toolCalls.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-white/20">
                                                        <p className="text-xs opacity-75 mb-1">Tools called:</p>
                                                        {(msg.toolCalls as Array<{ name: string }>).map((tool, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-block text-xs bg-white/20 px-2 py-0.5 rounded mr-1 mb-1"
                                                            >
                                                                {tool.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className={cn(
                                                    'text-xs mt-1',
                                                    msg.role === 'user' ? 'text-white/70' : 'text-gray-500'
                                                )}>
                                                    {formatRelativeTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center py-12 text-gray-500">
                                        No messages in this conversation
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                                <MessageSquare className="w-10 h-10 text-gray-600" />
                            </div>
                            <p className="text-lg font-medium text-gray-400">Select a conversation</p>
                            <p className="text-sm text-gray-500 mt-1">Choose from the list to view messages</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
