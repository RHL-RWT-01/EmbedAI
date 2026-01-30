'use client';

import { useAuthStore } from '@/lib/store';
import {
    ArrowRight,
    BarChart3,
    Check,
    ChevronRight,
    Code2,
    Cpu,
    Github,
    Globe,
    Loader2,
    Lock,
    Play,
    Rocket,
    Sparkles,
    Star,
    TrendingUp,
    Twitter,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const router = useRouter();
    const { checkAuth } = useAuthStore();
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
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
                <Loader2 className="animate-spin h-8 w-8 text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white overflow-x-hidden">
            {/* Subtle grid background */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px'
                }} />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black bg-opacity-80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-black" />
                                </div>
                                <span className="text-lg font-semibold tracking-tight">Embed</span>
                            </Link>
                            <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
                                <a href="#features" className="hover:text-white transition-colors">Features</a>
                                <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
                                <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                                <a href="#" className="hover:text-white transition-colors">Docs</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
                                Log in
                            </Link>
                            <Link href="/register" className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors">
                                Start free
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6">
                {/* Gradient orbs */}
                <div className="absolute top-40 left-1/4 w-96 h-96 bg-emerald-500 opacity-20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-60 right-1/4 w-80 h-80 bg-cyan-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto relative">
                    {/* Announcement banner */}
                    <div className="flex justify-center mb-8">
                        <a href="#" className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                <Sparkles className="w-3.5 h-3.5" />
                                New
                            </span>
                            <span className="text-zinc-400">GPT-4o & Claude 3.5 support</span>
                            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                    </div>

                    {/* Main headline */}
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                            Ship AI features
                            <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                                10x faster
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Embed is the fastest way to add an AI copilot to your product.
                            Connect your APIs, customize the experience, and deploy in minutes—not months.
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                            <Link href="/register" className="group inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3.5 rounded-lg text-base font-semibold hover:bg-zinc-200 transition-all">
                                Start building free
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <a href="#demo" className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-6 py-3.5 rounded-lg text-base font-medium hover:bg-white/10 transition-all">
                                <Play className="w-4 h-4" />
                                Watch demo
                            </a>
                        </div>

                        {/* Social proof */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-zinc-500">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                ))}
                            </div>
                            <span className="hidden sm:block text-zinc-700">•</span>
                            <span>Trusted by 500+ companies</span>
                            <span className="hidden sm:block text-zinc-700">•</span>
                            <span>10M+ conversations handled</span>
                        </div>
                    </div>

                    {/* Hero visual */}
                    <div className="mt-20 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent z-10 pointer-events-none" />
                        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-1 overflow-hidden">
                            <div className="rounded-xl bg-[#111113] p-6">
                                {/* Code window header */}
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                    <span className="ml-4 text-xs text-zinc-600 font-mono">embed.js</span>
                                </div>

                                {/* Code snippet */}
                                <div className="font-mono text-sm space-y-1">
                                    <div className="flex">
                                        <span className="text-zinc-600 w-8">1</span>
                                        <span>
                                            <span className="text-pink-400">import</span>{' '}
                                            <span className="text-cyan-400">{'{ Embed }'}</span>{' '}
                                            <span className="text-pink-400">from</span>{' '}
                                            <span className="text-emerald-400">'@embed/widget'</span>
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-zinc-600 w-8">2</span>
                                        <span></span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-zinc-600 w-8">3</span>
                                        <span>
                                            <span className="text-cyan-400">Embed</span>
                                            <span className="text-white">.</span>
                                            <span className="text-yellow-400">init</span>
                                            <span className="text-white">({'{'}</span>
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-zinc-600 w-8">4</span>
                                        <span className="pl-4">
                                            <span className="text-zinc-500">apiKey:</span>{' '}
                                            <span className="text-emerald-400">'your-api-key'</span>
                                            <span className="text-white">,</span>
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-zinc-600 w-8">5</span>
                                        <span className="pl-4">
                                            <span className="text-zinc-500">theme:</span>{' '}
                                            <span className="text-emerald-400">'dark'</span>
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-zinc-600 w-8">6</span>
                                        <span>
                                            <span className="text-white">{'}'});</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Floating chat widget mockup */}
                                <div className="absolute bottom-8 right-8 w-80 bg-[#1a1a1c] rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden hidden lg:block">
                                    <div className="p-4 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-black" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">AI Assistant</div>
                                                <div className="text-xs text-emerald-400">Online</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="bg-white/5 rounded-lg p-3 text-sm text-zinc-300">
                                            How can I check my order status?
                                        </div>
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-100">
                                            I found 2 recent orders. Your order #4523 shipped yesterday and arrives Friday! 📦
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-white/5">
                                        <div className="bg-white/5 rounded-lg px-4 py-2.5 text-sm text-zinc-500">
                                            Ask anything...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logo cloud */}
                    <div className="mt-24">
                        <p className="text-center text-sm text-zinc-600 mb-8 uppercase tracking-wider">
                            Powering the best product teams
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-50">
                            {['Vercel', 'Stripe', 'Linear', 'Notion', 'Figma', 'Raycast'].map((company) => (
                                <div key={company} className="text-xl font-semibold text-zinc-500 tracking-tight">
                                    {company}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-6">
                            <Zap className="w-3.5 h-3.5" />
                            Features
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                            Everything you need to
                            <br />
                            build AI experiences
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            From API integration to analytics, Embed gives you the complete toolkit to ship production-ready AI features.
                        </p>
                    </div>

                    {/* Feature grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Code2, title: 'API-First Integration', description: 'Connect any REST API with OpenAPI spec support. Our AI understands your endpoints automatically.', gradient: 'from-emerald-500 to-cyan-500' },
                            { icon: Cpu, title: 'Multi-Model Support', description: 'GPT-4o, Claude 3.5, Gemini Pro—use the best model for your use case, or let us choose.', gradient: 'from-violet-500 to-pink-500' },
                            { icon: Lock, title: 'Enterprise Security', description: 'SOC 2 compliant, end-to-end encryption, and full data residency control.', gradient: 'from-orange-500 to-red-500' },
                            { icon: BarChart3, title: 'Real-time Analytics', description: 'Track conversations, API usage, and user satisfaction with detailed dashboards.', gradient: 'from-blue-500 to-cyan-500' },
                            { icon: Globe, title: '30+ Languages', description: 'Automatic language detection and response. Speak to users in their native language.', gradient: 'from-emerald-500 to-teal-500' },
                            { icon: Rocket, title: 'One-Line Deploy', description: 'Copy. Paste. Done. Deploy to any website or app with a single script tag.', gradient: 'from-pink-500 to-rose-500' }
                        ].map((feature, i) => (
                            <div key={i} className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="py-32 px-6 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-6">
                            <Sparkles className="w-3.5 h-3.5" />
                            How it works
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                            Go live in 5 minutes
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            No complex setup. No infrastructure to manage. Just three simple steps.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-emerald-500/50 via-cyan-500/50 to-emerald-500/50" />

                        {[
                            { step: '01', title: 'Connect APIs', description: 'Import your OpenAPI spec or manually define endpoints. We automatically generate AI-friendly schemas.', icon: Code2 },
                            { step: '02', title: 'Customize', description: 'Match your brand with custom themes, personality settings, and response behavior.', icon: Sparkles },
                            { step: '03', title: 'Deploy', description: 'Add one line of JavaScript to your site. Your AI copilot is live.', icon: Rocket }
                        ].map((item, i) => (
                            <div key={i} className="relative text-center">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 relative z-10">
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-sm font-mono text-emerald-400 mb-2">{item.step}</div>
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-zinc-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social proof / Testimonials */}
            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                            Loved by developers
                        </h2>
                        <p className="text-lg text-zinc-400">
                            See what our users are saying about Embed
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { quote: "Embed saved us 3 months of development time. We went from idea to production in a week.", author: "Sarah Chen", role: "CTO, Acme Inc", avatar: "SC" },
                            { quote: "The API integration is magical. It just works with our existing backend.", author: "Marcus Johnson", role: "Lead Engineer, StartupXYZ", avatar: "MJ" },
                            { quote: "Our support ticket volume dropped 40% after implementing Embed. Users love it.", author: "Emma Williams", role: "Head of Product, TechCo", avatar: "EW" }
                        ].map((testimonial, i) => (
                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                                <p className="text-zinc-300 mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-sm font-semibold">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{testimonial.author}</div>
                                        <div className="text-zinc-500 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats section */}
            <section className="py-24 px-6 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '10M+', label: 'Messages processed' },
                            { value: '500+', label: 'Companies' },
                            { value: '99.9%', label: 'Uptime' },
                            { value: '<200ms', label: 'Avg response' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-zinc-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing section */}
            <section id="pricing" className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-6">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Pricing
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            Start free, scale as you grow. No hidden fees.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {/* Free tier */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                            <div className="text-sm text-zinc-400 mb-2">Starter</div>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-zinc-500">/month</span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-6">Perfect for side projects and experimentation.</p>
                            <Link href="/register" className="block text-center w-full py-3 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors mb-6">
                                Get started free
                            </Link>
                            <ul className="space-y-3">
                                {['1,000 messages/month', '1 API integration', 'Community support', 'Basic analytics'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro tier - highlighted */}
                        <div className="relative bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-8">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-black text-xs font-semibold rounded-full">
                                Most popular
                            </div>
                            <div className="text-sm text-emerald-400 mb-2">Pro</div>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-bold">$49</span>
                                <span className="text-zinc-500">/month</span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-6">For growing teams and production apps.</p>
                            <Link href="/register" className="block text-center w-full py-3 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors mb-6">
                                Start free trial
                            </Link>
                            <ul className="space-y-3">
                                {['50,000 messages/month', 'Unlimited API integrations', 'Priority support', 'Advanced analytics', 'Custom branding', 'Team collaboration'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Enterprise tier */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                            <div className="text-sm text-zinc-400 mb-2">Enterprise</div>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-bold">Custom</span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-6">For large organizations with custom needs.</p>
                            <a href="#" className="block text-center w-full py-3 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors mb-6">
                                Contact sales
                            </a>
                            <ul className="space-y-3">
                                {['Unlimited messages', 'Dedicated support', 'Custom SLA', 'On-premise option', 'SOC 2 report', 'SSO / SAML'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 blur-3xl rounded-full" />
                        <div className="relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-12 sm:p-16">
                            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                                Ready to ship AI?
                            </h2>
                            <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
                                Join hundreds of teams building the future of software with Embed. Start free today.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="/register" className="group inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-lg text-base font-semibold hover:bg-zinc-200 transition-all">
                                    Start building free
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <a href="#" className="inline-flex items-center justify-center gap-2 border border-white/10 px-8 py-4 rounded-lg text-base font-medium hover:bg-white/5 transition-all">
                                    Talk to sales
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2">
                            <Link href="/" className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-black" />
                                </div>
                                <span className="text-lg font-semibold tracking-tight">Embed</span>
                            </Link>
                            <p className="text-zinc-500 text-sm mb-4 max-w-xs">
                                The fastest way to add AI copilot features to your product.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                                    <Github className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-sm">Product</h4>
                            <ul className="space-y-3 text-sm text-zinc-500">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-sm">Company</h4>
                            <ul className="space-y-3 text-sm text-zinc-500">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
                            <ul className="space-y-3 text-sm text-zinc-500">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-600">
                        <p>© 2026 Embed. All rights reserved.</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            All systems operational
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
