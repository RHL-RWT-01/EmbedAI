'use client';

import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Server, MessageSquare, BarChart3, Settings, Menu, LogOut, Loader2 } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'APIs', href: '/dashboard/apis', icon: Server },
    { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, tenant, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) {
                router.push('/login');
            } else if (!tenant) {
                router.push('/onboarding');
            }
        };
        init();
    }, [checkAuth, router, tenant]);

    if (isLoading || !isAuthenticated || !tenant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto shadow-2xl',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white">UseEmbed</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all transform hover:translate-x-1',
                                        isActive
                                            ? 'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10'
                                            : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <span className="text-white font-medium text-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{tenant?.name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    router.push('/login');
                                }}
                                className="p-2 text-gray-400 hover:text-emerald-500 rounded-lg hover:bg-zinc-800 transition-all transform hover:scale-110"
                                title="Sign out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Mobile header */}
                <header className="sticky top-0 z-40 flex items-center gap-4 px-4 py-4 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg text-white">UseEmbed</span>
                </header>

                {/* Page content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
