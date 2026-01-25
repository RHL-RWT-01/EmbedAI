'use client';

import apiClient from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface ApiForm {
    name: string;
    description: string;
    baseUrl: string;
    authType: 'none' | 'bearer' | 'api_key' | 'basic';
    authToken?: string;
    apiKeyHeader?: string;
    apiKeyValue?: string;
}

export default function NewApiPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [openApiFile, setOpenApiFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ApiForm>({
        defaultValues: {
            authType: 'none',
        },
    });

    const authType = watch('authType');

    const onSubmit = async (data: ApiForm) => {
        setIsLoading(true);
        try {
            let openApiSpec = undefined;

            if (openApiFile) {
                const text = await openApiFile.text();
                openApiSpec = JSON.parse(text);
            }

            const authConfig: Record<string, unknown> = {};
            if (data.authType === 'bearer' && data.authToken) {
                authConfig.token = data.authToken;
            } else if (data.authType === 'api_key' && data.apiKeyHeader && data.apiKeyValue) {
                authConfig.headerName = data.apiKeyHeader;
                authConfig.key = data.apiKeyValue;
            }

            await apiClient.createApi({
                name: data.name,
                description: data.description || undefined,
                baseUrl: data.baseUrl,
                authType: data.authType,
                authConfig: Object.keys(authConfig).length > 0 ? authConfig : undefined,
                openApiSpec,
            });

            toast.success('API created successfully');
            router.push('/dashboard/apis');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create API');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to APIs
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Add New API</h1>
                <p className="text-gray-500 mt-1">
                    Connect a new API for your AI assistant to interact with.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                API Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                {...register('name', {
                                    required: 'API name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="My API"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                {...register('description')}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                                placeholder="Describe what this API does..."
                            />
                        </div>

                        <div>
                            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                Base URL *
                            </label>
                            <input
                                type="url"
                                id="baseUrl"
                                {...register('baseUrl', {
                                    required: 'Base URL is required',
                                    pattern: {
                                        value: /^https?:\/\/.+/,
                                        message: 'Must be a valid URL starting with http:// or https://',
                                    },
                                })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="https://api.example.com"
                            />
                            {errors.baseUrl && (
                                <p className="mt-1 text-sm text-red-500">{errors.baseUrl.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="authType" className="block text-sm font-medium text-gray-700 mb-1">
                                Authentication Type
                            </label>
                            <select
                                id="authType"
                                {...register('authType')}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            >
                                <option value="none">None</option>
                                <option value="bearer">Bearer Token</option>
                                <option value="api_key">API Key</option>
                            </select>
                        </div>

                        {authType === 'bearer' && (
                            <div>
                                <label htmlFor="authToken" className="block text-sm font-medium text-gray-700 mb-1">
                                    Bearer Token
                                </label>
                                <input
                                    type="password"
                                    id="authToken"
                                    {...register('authToken')}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="Enter your bearer token"
                                />
                            </div>
                        )}

                        {authType === 'api_key' && (
                            <>
                                <div>
                                    <label htmlFor="apiKeyHeader" className="block text-sm font-medium text-gray-700 mb-1">
                                        Header Name
                                    </label>
                                    <input
                                        type="text"
                                        id="apiKeyHeader"
                                        {...register('apiKeyHeader')}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        placeholder="X-API-Key"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="apiKeyValue" className="block text-sm font-medium text-gray-700 mb-1">
                                        API Key
                                    </label>
                                    <input
                                        type="password"
                                        id="apiKeyValue"
                                        {...register('apiKeyValue')}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        placeholder="Enter your API key"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">OpenAPI Specification</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Upload an OpenAPI (Swagger) specification to automatically import endpoints.
                    </p>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                        <input
                            type="file"
                            accept=".json,.yaml,.yml"
                            onChange={(e) => setOpenApiFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="openapi-file"
                        />
                        <label htmlFor="openapi-file" className="cursor-pointer">
                            <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {openApiFile ? (
                                <p className="text-sm text-primary-600 font-medium">{openApiFile.name}</p>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">JSON or YAML format</p>
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating...' : 'Create API'}
                    </button>
                </div>
            </form>
        </div>
    );
}
