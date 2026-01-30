'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { createClient } from 'useembed-sdk';
import type { Message, UseEmbedClient } from 'useembed-sdk';
import { useAuthStore } from '@/lib/store';
import { MessageSquare, Send, X, RotateCcw, Sparkles, Bot, User } from 'lucide-react';

/**
 * AI Copilot Chat Widget Component
 * Demonstrates how to use the useembed-sdk in your application
 */
export default function CopilotWidget() {
    const { tenant } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const clientRef = useRef<UseEmbedClient | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize client when tenant is available
    useEffect(() => {
        if (!tenant?.apiKey) return;

        const client = createClient({
            apiKey: tenant.apiKey,
            serverUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
            onReady: () => setIsReady(true),
            onError: (err) => setError(err.message),
            onMessage: (msg) => console.log('New message:', msg),
        });

        clientRef.current = client;

        // Initialize and load existing messages
        client.init()
            .then((response) => {
                setMessages(response.conversation.messages || []);
                setIsReady(true);
            })
            .catch((err) => {
                setError(err.message);
            });

        return () => {
            clientRef.current = null;
        };
    }, [tenant?.apiKey]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !clientRef.current) return;

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);
        setError(null);

        // Optimistic update - add user message immediately
        const tempUserMessage: Message = {
            id: `temp_user_${Date.now()}`,
            role: 'user',
            content: userMessage,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempUserMessage]);

        try {
            const response = await clientRef.current.sendMessage(userMessage);

            // Replace temp message and add assistant response
            setMessages((prev) => {
                const filtered = prev.filter((m) => m.id !== tempUserMessage.id);
                return [
                    ...filtered,
                    { ...tempUserMessage, id: `user_${Date.now()}` },
                    response.message,
                ];
            });
        } catch (err) {
            setError((err as Error).message);
            // Remove optimistic message on error
            setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as FormEvent);
        }
    };

    const handleReset = () => {
        if (!clientRef.current) return;
        clientRef.current.reset();
        setMessages([]);
        setIsReady(false);
        setError(null);

        clientRef.current.init()
            .then((response) => {
                setMessages(response.conversation.messages || []);
                setIsReady(true);
            })
            .catch((err) => {
                setError(err.message);
            });
    };

    if (!tenant?.apiKey) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[400px] h-[600px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{tenant.settings?.agentName || 'AI Copilot'}</h3>
                                <p className="text-sm text-emerald-100 opacity-80">
                                    {isReady ? 'Online' : 'Connecting...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleReset}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="New conversation"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {!isReady && !error && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-400">
                                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p>Initializing AI...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-center">
                                <p className="font-medium mb-1">Connection Error</p>
                                <p className="text-sm opacity-80">{error}</p>
                                <button
                                    onClick={handleReset}
                                    className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {isReady && messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center mb-4">
                                    <Bot className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h4 className="text-white font-medium mb-2">
                                    {tenant.settings?.agentName ? `Chat with ${tenant.settings.agentName}` : 'How can I help you?'}
                                </h4>
                                <p className="text-sm max-w-[250px]">
                                    {tenant.settings?.greeting || 'Ask me anything about your APIs, or let me help you automate tasks.'}
                                </p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}

                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-zinc-800 rounded-2xl rounded-tl-md px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
                        <div className="flex gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                disabled={!isReady || isLoading}
                                className="flex-1 bg-zinc-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!isReady || isLoading || !input.trim()}
                                className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${isOpen
                        ? 'bg-zinc-800 text-gray-400 hover:text-white rotate-0'
                        : 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white hover:shadow-emerald-500/50'
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageSquare className="w-6 h-6" />
                )}
            </button>
        </div>
    );
}

/**
 * Individual message bubble component
 */
function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    return (
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isUser
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    }`}
            >
                {isUser ? (
                    <User className="w-4 h-4 text-white" />
                ) : (
                    <Bot className="w-4 h-4 text-white" />
                )}
            </div>

            {/* Message content */}
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-md'
                    : 'bg-zinc-800 text-gray-200 rounded-tl-md'
                    }`}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                </p>

                {/* Tool calls indicator */}
                {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs opacity-60 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {message.toolCalls.length} API{message.toolCalls.length > 1 ? 's' : ''} called
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
