'use client';

import apiClient from '@/lib/api';
import { useConversationMessages, useConversations } from '@/lib/hooks';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';

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
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Conversation List */}
            <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Conversations</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {data?.pagination?.total || 0} total
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
                        </div>
                    ) : data?.items && data.items.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {data.items.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={cn(
                                        'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                                        selectedId === conv.id && 'bg-primary-50 hover:bg-primary-50'
                                    )}
                                    onClick={() => setSelectedId(conv.id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {conv.title || 'Untitled conversation'}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {conv.messageCount} messages
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-gray-400">
                                                {formatRelativeTime(conv.lastMessageAt || conv.createdAt)}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(conv.id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-gray-500">No conversations yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Panel */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                {selectedId ? (
                    <>
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-900">
                                {data?.items?.find((c) => c.id === selectedId)?.title || 'Conversation'}
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messagesLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
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
                                                    ? 'bg-primary-600 text-white rounded-br-md'
                                                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                            )}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            {msg.toolCalls && msg.toolCalls.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-200/50">
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
                                                msg.role === 'user' ? 'text-white/70' : 'text-gray-400'
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
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p>Select a conversation to view messages</p>
                    </div>
                )}
            </div>
        </div>
    );
}
