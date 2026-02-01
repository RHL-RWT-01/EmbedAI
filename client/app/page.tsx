'use client';

import { useAuthStore } from '@/lib/store';
import {
    ArrowRight,
    Check,
    Copy,
    Github,
    Loader2,
    MessageSquare,
    Sparkles,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const router = useRouter();
    const { checkAuth } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (authenticated) {
                router.push('/dashboard');
            }
            setIsChecking(false);
        };
        init();
    }, [checkAuth, router]);

    const handleCopy = () => {
        navigator.clipboard.writeText('npm install useembed-sdk');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
                <Loader2 className="animate-spin h-8 w-8 text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Grid */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }} />
                {/* Gradient orbs */}
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                                <Sparkles className="w-4 h-4 text-black" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">Embed AI</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
                                Log in
                            </Link>
                            <Link href="/register" className="text-sm bg-white text-black px-4 py-2.5 rounded-lg font-medium hover:bg-zinc-100 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-36 pb-16 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm mb-10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-zinc-300">Open Source SDK</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
                        <span className="block">Add an AI copilot</span>
                        <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                            to your product
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed">
                        Drop-in React SDK that connects to your APIs.<br className="hidden sm:block" />
                        Users ask questions, AI executes the right calls.
                    </p>

                    {/* Install command */}
                    <div className="flex justify-center mb-10">
                        <button
                            onClick={handleCopy}
                            className="group flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all font-mono text-sm backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="text-emerald-400">$</span>
                            <span className="text-white">npm install useembed-sdk</span>
                            <div className="w-px h-4 bg-white/20" />
                            {copied ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <Copy className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                            )}
                        </button>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/register" className="group inline-flex items-center justify-center gap-2 bg-white text-black px-7 py-3.5 rounded-xl font-semibold hover:bg-zinc-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10">
                            Get API Key
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="https://github.com/useembed/sdk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 border border-white/10 px-7 py-3.5 rounded-xl font-medium hover:bg-white/5 hover:border-white/20 transition-all"
                        >
                            <Github className="w-4 h-4" />
                            GitHub
                        </a>
                    </div>
                </div>
            </section>

            {/* Code + Widget Preview */}
            <section className="relative pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        {/* Glow behind code */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20 rounded-3xl blur-2xl opacity-50" />

                        <div className="relative grid lg:grid-cols-5 gap-6">
                            {/* Code Block */}
                            <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-[#0d0d0f] overflow-hidden backdrop-blur-sm">
                                {/* Window header */}
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                                    </div>
                                    <span className="ml-3 text-xs text-zinc-500 font-mono">App.tsx</span>
                                </div>

                                {/* Code */}
                                <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto">
                                    <div><span className="text-pink-400">import</span> <span className="text-cyan-400">{'{ ChatWidget }'}</span> <span className="text-pink-400">from</span> <span className="text-emerald-400">'useembed-sdk/react'</span></div>
                                    <div className="h-5" />
                                    <div><span className="text-pink-400">function</span> <span className="text-yellow-400">App</span><span className="text-zinc-400">() {'{'}</span></div>
                                    <div className="pl-4"><span className="text-pink-400">return</span> <span className="text-zinc-400">(</span></div>
                                    <div className="pl-8"><span className="text-zinc-600">{'<>'}</span></div>
                                    <div className="pl-12"><span className="text-zinc-600">{'<YourApp />'}</span></div>
                                    <div className="pl-12">
                                        <span className="text-cyan-400">{'<ChatWidget'}</span>
                                    </div>
                                    <div className="pl-16">
                                        <span className="text-zinc-400">apiKey</span><span className="text-white">=</span><span className="text-emerald-400">"ek_..."</span>
                                    </div>
                                    <div className="pl-16">
                                        <span className="text-zinc-400">name</span><span className="text-white">=</span><span className="text-emerald-400">"Assistant"</span>
                                    </div>
                                    <div className="pl-12">
                                        <span className="text-cyan-400">{'/>'}</span>
                                    </div>
                                    <div className="pl-8"><span className="text-zinc-600">{'</>'}</span></div>
                                    <div className="pl-4"><span className="text-zinc-400">)</span></div>
                                    <div><span className="text-zinc-400">{'}'}</span></div>
                                </div>
                            </div>

                            {/* Widget Preview */}
                            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0d0d0f] overflow-hidden backdrop-blur-sm flex flex-col">
                                {/* Widget header */}
                                <div className="p-4 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                            <Sparkles className="w-4 h-4 text-black" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">Assistant</div>
                                            <div className="text-xs text-emerald-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                Online
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat messages */}
                                <div className="flex-1 p-4 space-y-3">
                                    <div className="bg-white/5 rounded-xl rounded-tl-sm p-3 text-sm text-zinc-300 max-w-[90%]">
                                        Show my recent orders
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 rounded-xl rounded-tr-sm p-3 text-sm ml-auto max-w-[90%]">
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-2">
                                            <Zap className="w-3 h-3" />
                                            GET /api/orders
                                        </div>
                                        <span className="text-zinc-200">Found 3 orders. Latest: #4821 arrives Friday 📦</span>
                                    </div>
                                </div>

                                {/* Input */}
                                <div className="p-3 border-t border-white/5">
                                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5">
                                        <MessageSquare className="w-4 h-4 text-zinc-600" />
                                        <span className="text-sm text-zinc-600">Ask anything...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flow indicators */}
                    <div className="mt-12 flex justify-center">
                        <div className="inline-flex items-center gap-3 sm:gap-6 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg">💬</div>
                                <span className="text-zinc-400 hidden sm:inline">User asks</span>
                            </div>
                            <div className="text-zinc-700">→</div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-lg">⚡</div>
                                <span className="text-zinc-400 hidden sm:inline">AI calls APIs</span>
                            </div>
                            <div className="text-zinc-700">→</div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-lg">✨</div>
                                <span className="text-zinc-400 hidden sm:inline">Smart response</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative border-t border-white/5 py-8 px-6">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-black" />
                        </div>
                        <span>Embed AI</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="https://github.com/useembed/sdk" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            GitHub
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            Docs
                        </a>
                    </div>
                </div>
            </footer>

            {/* CSS for gradient animation */}
            <style jsx>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% center; }
                    50% { background-position: 100% center; }
                }
                .animate-gradient {
                    animation: gradient 6s ease infinite;
                }
            `}</style>
        </div>
    );
}
