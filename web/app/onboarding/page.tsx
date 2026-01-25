'use client';

import apiClient from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { Tenant } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2, CheckCircle2 } from 'lucide-react';

interface OnboardingForm {
    tenantName: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const { setTenant } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OnboardingForm>();

    const onSubmit = async (data: OnboardingForm) => {
        setIsLoading(true);
        try {
            const tenant = await apiClient.createTenant(data.tenantName);
            setTenant(tenant as unknown as Tenant);
            toast.success('Organization created successfully!');
            router.push('/dashboard');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create organization');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-lg">
                <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Create your organization</h1>
                        <p className="text-gray-400 mt-2">
                            Set up your organization to start using UseEmbed&apos;s AI chat widget
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label
                                htmlFor="tenantName"
                                className="block text-sm font-semibold text-gray-300 mb-2"
                            >
                                Organization Name
                            </label>
                            <input
                                type="text"
                                id="tenantName"
                                {...register('tenantName', {
                                    required: 'Organization name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
                                })}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-white placeholder:text-gray-500"
                                placeholder="Acme Inc."
                            />
                            {errors.tenantName && (
                                <p className="mt-1.5 text-sm text-red-400">{errors.tenantName.message}</p>
                            )}
                            <p className="mt-2 text-sm text-gray-500">
                                This will be your organization&apos;s display name
                            </p>
                        </div>

                        {/* Features */}
                        <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700">
                            <h3 className="text-sm font-semibold text-white mb-3">
                                What you&apos;ll get:
                            </h3>
                            <ul className="space-y-2.5">
                                {[
                                    'Embeddable AI chat widget for your product',
                                    'Connect and manage your APIs',
                                    'Real-time chat with AI-powered responses',
                                    'Analytics and usage insights',
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-center text-sm text-gray-300">
                                        <svg
                                            className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
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
                                    Creating organization...
                                </span>
                            ) : (
                                'Create organization'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
