'use client';

import apiClient from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { User } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageSquare } from 'lucide-react';

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const { setAuth, checkAuth, isAuthenticated, isLoading: authLoading } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>();

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (authenticated) {
                const currentTenant = useAuthStore.getState().tenant;
                if (currentTenant) {
                    router.push('/dashboard');
                } else {
                    router.push('/onboarding');
                }
            }
        };
        init();
    }, [checkAuth, router]);

    if (authLoading || isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="animate-spin h-8 w-8 text-emerald-500" />
            </div>
        );
    }

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const response = await apiClient.login(data.email, data.password);

            setAuth({
                user: response.user as unknown as User,
                tenant: null,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
            });

            toast.success('Welcome back!');

            // Check if user has a tenant
            if (response.user.tenantId) {
                router.push('/dashboard');
            } else {
                router.push('/onboarding');
            }
        } catch (error) {
            toast.error((error as Error).message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            {/* Back to Home Link */}
            <Link
                href="/"
                className="fixed top-4 left-4 text-gray-400 hover:text-emerald-500 flex items-center gap-2 font-medium transition-all hover:translate-x-1"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
            </Link>

            <div className="w-full max-w-md">
                <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8 transform hover:scale-[1.01] transition-transform duration-300">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20">
                            <MessageSquare className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                        <p className="text-gray-400 mt-2">Sign in to your account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Invalid email address',
                                    },
                                })}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-white placeholder:text-gray-500"
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                {...register('password', {
                                    required: 'Password is required',
                                })}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-white placeholder:text-gray-500"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <span className="inline-flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-emerald-500 hover:text-emerald-400 font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
