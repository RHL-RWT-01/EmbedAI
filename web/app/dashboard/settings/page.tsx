'use client';

import apiClient from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { Tenant, TenantSettings } from '@/lib/types';
import { copyToClipboard } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { tenant, setTenant } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const [settings, setSettings] = useState<Partial<TenantSettings>>({
        aiProvider: (tenant?.settings as TenantSettings)?.aiProvider || 'gemini',
        maxTokensPerMessage: (tenant?.settings as TenantSettings)?.maxTokensPerMessage || 2048,
        rateLimitPerMinute: (tenant?.settings as TenantSettings)?.rateLimitPerMinute || 60,
        widgetTheme: (tenant?.settings as TenantSettings)?.widgetTheme || {
            primaryColor: '#0ea5e9',
            fontFamily: 'Inter',
            borderRadius: 12,
            position: 'bottom-right',
            headerText: 'How can I help you?',
            placeholderText: 'Type your message...',
            buttonIcon: 'chat',
        },
    });

    const handleSaveSettings = async () => {
        setIsLoading(true);
        try {
            const updated = await apiClient.updateTenant({ settings });
            setTenant(updated as unknown as Tenant);
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateApiKey = async () => {
        if (!confirm('Are you sure? This will invalidate your current API key.')) return;

        setIsRegenerating(true);
        try {
            const { apiKey } = await apiClient.regenerateApiKey();
            setTenant({ ...tenant!, apiKey } as Tenant);
            toast.success('API key regenerated');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to regenerate API key');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleCopyApiKey = async () => {
        if (tenant?.apiKey) {
            await copyToClipboard(tenant.apiKey);
            toast.success('API key copied to clipboard');
        }
    };

    const handleCopyWidgetCode = async () => {
        const code = `<script src="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/widget.js" data-api-key="${tenant?.apiKey}"></script>`;
        await copyToClipboard(code);
        toast.success('Widget code copied to clipboard');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">
                    Configure your UseEmbed workspace and widget settings.
                </p>
            </div>

            {/* API Key Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">API Key</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Use this API key to authenticate your widget and API requests.
                </p>

                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-sm">
                        {showApiKey ? tenant?.apiKey : '••••••••••••••••••••••••••••'}
                    </div>
                    <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title={showApiKey ? 'Hide' : 'Show'}
                    >
                        {showApiKey ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={handleCopyApiKey}
                        className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleRegenerateApiKey}
                        disabled={isRegenerating}
                        className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                </div>
            </div>

            {/* Widget Code Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Widget Installation</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Add this code snippet to your website to embed the AI chat widget.
                </p>

                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                    <code>
                        {`<script src="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/widget.js" data-api-key="${tenant?.apiKey?.slice(0, 10)}..."></script>`}
                    </code>
                </div>

                <button
                    onClick={handleCopyWidgetCode}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy code
                </button>
            </div>

            {/* AI Settings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Settings</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
                        <select
                            value={settings.aiProvider}
                            onChange={(e) =>
                                setSettings({ ...settings, aiProvider: e.target.value as 'gemini' | 'openai' })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        >
                            <option value="gemini">Google Gemini (Default)</option>
                            <option value="openai">OpenAI GPT</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Tokens per Message
                        </label>
                        <input
                            type="number"
                            value={settings.maxTokensPerMessage}
                            onChange={(e) =>
                                setSettings({ ...settings, maxTokensPerMessage: Number(e.target.value) })
                            }
                            min={100}
                            max={8000}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rate Limit (requests/minute)
                        </label>
                        <input
                            type="number"
                            value={settings.rateLimitPerMinute}
                            onChange={(e) =>
                                setSettings({ ...settings, rateLimitPerMinute: Number(e.target.value) })
                            }
                            min={1}
                            max={1000}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Widget Theme */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Widget Theme</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={settings.widgetTheme?.primaryColor || '#0ea5e9'}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        widgetTheme: { ...settings.widgetTheme!, primaryColor: e.target.value },
                                    })
                                }
                                className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={settings.widgetTheme?.primaryColor || '#0ea5e9'}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        widgetTheme: { ...settings.widgetTheme!, primaryColor: e.target.value },
                                    })
                                }
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <select
                            value={settings.widgetTheme?.position || 'bottom-right'}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    widgetTheme: {
                                        ...settings.widgetTheme!,
                                        position: e.target.value as 'bottom-right' | 'bottom-left',
                                    },
                                })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        >
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Header Text</label>
                        <input
                            type="text"
                            value={settings.widgetTheme?.headerText || ''}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    widgetTheme: { ...settings.widgetTheme!, headerText: e.target.value },
                                })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            placeholder="How can I help you?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Input Placeholder
                        </label>
                        <input
                            type="text"
                            value={settings.widgetTheme?.placeholderText || ''}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    widgetTheme: { ...settings.widgetTheme!, placeholderText: e.target.value },
                                })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            placeholder="Type your message..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Border Radius (px)
                        </label>
                        <input
                            type="number"
                            value={settings.widgetTheme?.borderRadius || 12}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    widgetTheme: { ...settings.widgetTheme!, borderRadius: Number(e.target.value) },
                                })
                            }
                            min={0}
                            max={32}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
