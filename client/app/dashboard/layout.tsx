'use client';

import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Server, MessageSquare, BarChart3, Settings, Menu, LogOut, Loader2, PanelLeftClose, PanelLeft, X } from 'lucide-react';
import CopilotWidget from '@/components/CopilotWidget';

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) {
                router.push('/login');
            } else {
                const currentTenant = useAuthStore.getState().tenant;
                if (!currentTenant) {
                    router.push('/onboarding');
                }
            }
        };
        init();
    }, [checkAuth, router]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

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

    const sidebarWidth = collapsed ? 'w-20' : 'w-64';
    const sidebarMargin = collapsed ? 'lg:ml-20' : 'lg:ml-64';

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* ===== SIDEBAR (Fixed Position) ===== */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 bg-zinc-900 border-r border-zinc-800 shadow-2xl',
                    'hidden lg:flex lg:flex-col',
                    'transition-all duration-300 ease-in-out',
                    sidebarWidth
                )}
            >
                {/* Logo */}
                <div className={cn(
                    'flex items-center h-16 border-b border-zinc-800 flex-shrink-0',
                    collapsed ? 'justify-center px-4' : 'gap-3 px-6'
                )}>
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-xl text-white whitespace-nowrap">Embed</span>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                            'text-gray-400 hover:bg-zinc-800 hover:text-white transition-all',
                            collapsed && 'justify-center px-0'
                        )}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? (
                            <PanelLeft className="w-5 h-5" />
                        ) : (
                            <>
                                <PanelLeftClose className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className={cn(
                    'flex-1 py-6 space-y-1 overflow-y-auto',
                    collapsed ? 'px-3' : 'px-4'
                )}>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                                    isActive
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'text-gray-400 hover:bg-zinc-800 hover:text-white',
                                    collapsed && 'justify-center px-0'
                                )}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span>{item.name}</span>}
                                
                                {/* Tooltip for collapsed state */}
                                {collapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className={cn(
                    'p-4 border-t border-zinc-800',
                    collapsed && 'px-3'
                )}>
                    <div className={cn(
                        'flex items-center',
                        collapsed ? 'flex-col gap-3' : 'gap-3'
                    )}>
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                            <span className="text-white font-medium text-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{tenant?.name}</p>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                logout();
                                router.push('/login');
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-all"
                            title="Sign out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ===== MOBILE MENU OVERLAY ===== */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    
                    {/* Mobile Sidebar */}
                    <aside className="fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 shadow-2xl flex flex-col">
                        {/* Header with close button */}
                        <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl text-white">UseEmbed</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
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
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                            isActive
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Section */}
                        <div className="p-4 border-t border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
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
                                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-all"
                                    title="Sign out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* ===== MAIN CONTENT AREA ===== */}
            <div className={cn(
                'min-h-screen flex flex-col transition-all duration-300',
                sidebarMargin
            )}>
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-4 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 lg:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-xl text-white">UseEmbed</span>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8 lg:p-10">
                    {children}
                </main>
            </div>

            {/* AI Copilot Widget */}
            <CopilotWidget />
        </div>
    );
}
