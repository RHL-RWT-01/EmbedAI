'use client';

import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, Zap, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

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

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg"></div>
                            <span className="text-xl font-bold text-white">
                                Embed
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="text-gray-300 hover:text-white font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/register"
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-medium"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-block mb-4 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/20">
                            🚀 AI-Powered Chat Widget
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            Embed AI Copilot
                            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                                {' '}Into Your Product
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                            Transform your software with an intelligent chat widget that integrates your APIs.
                            Give your users AI-powered assistance in minutes, not months.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href="/register"
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all"
                            >
                                Start Free Trial
                            </Link>
                            <a
                                href="#features"
                                className="bg-zinc-900 text-gray-300 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-zinc-800 hover:border-emerald-500/50 hover:shadow-lg transition-all"
                            >
                                See How It Works
                            </a>
                        </div>
                        <p className="mt-6 text-sm text-gray-500">
                            No credit card required • Free 14-day trial • 5-minute setup
                        </p>
                    </div>

                    {/* Demo Image/Video Placeholder */}
                    <div className="mt-16 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur-3xl opacity-20"></div>
                        <div className="relative bg-zinc-900 rounded-2xl shadow-2xl p-4 border border-zinc-800">
                            <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-lg">Interactive Chat Widget Demo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Everything you need to build AI experiences
                        </h2>
                        <p className="text-xl text-gray-400">
                            Connect your APIs, customize the widget, and deploy in minutes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-zinc-800 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/10 transition-all border border-zinc-700">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Instant API Integration</h3>
                            <p className="text-gray-400">
                                Connect your REST APIs in seconds. Our AI automatically understands your endpoints and makes intelligent calls.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-zinc-800 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/10 transition-all border border-zinc-700">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Fully Customizable</h3>
                            <p className="text-gray-400">
                                Match your brand perfectly. Customize colors, behavior, and personality to fit your product.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-zinc-800 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/10 transition-all border border-zinc-700">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Analytics & Insights</h3>
                            <p className="text-gray-400">
                                Track usage, conversations, and API calls. Understand how users interact with your AI copilot.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Deploy in 3 simple steps
                        </h2>
                        <p className="text-xl text-gray-400">
                            From zero to AI-powered assistant in minutes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Connect Your APIs</h3>
                            <p className="text-gray-400">
                                Import your OpenAPI spec or add endpoints manually. We'll handle the rest.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Customize Widget</h3>
                            <p className="text-gray-400">
                                Configure colors, behavior, and AI personality to match your brand.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Embed & Launch</h3>
                            <p className="text-gray-400">
                                Copy a single line of code. Paste it in your app. You're live!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-500 to-emerald-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to transform your product?
                    </h2>
                    <p className="text-xl text-emerald-50 mb-8">
                        Join hundreds of developers building the next generation of AI-powered software
                    </p>
                    <Link
                        href="/register"
                        className="inline-block bg-white text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all"
                    >
                        Start Building For Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-950 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg"></div>
                                <span className="text-white font-bold text-lg">Embed</span>
                            </div>
                            <p className="text-sm">
                                AI-powered chat widgets for modern software products.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-zinc-900 mt-12 pt-8 text-center text-sm">
                        <p>&copy; 2026 Embed. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
