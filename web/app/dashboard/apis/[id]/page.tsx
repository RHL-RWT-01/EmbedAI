'use client';

import apiClient from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Endpoint {
    id: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    summary: string;
    description?: string;
    parameters?: Array<{
        name: string;
        in: 'path' | 'query' | 'header' | 'body';
        type: string;
        required: boolean;
        description?: string;
    }>;
    requestBody?: {
        contentType: string;
        schema: Record<string, unknown>;
    };
    isActive: boolean;
}

interface ApiConfig {
    id: string;
    name: string;
    description?: string;
    baseUrl: string;
    authentication: {
        type: 'none' | 'apiKey' | 'bearer' | 'basic';
        config?: Record<string, string>;
    };
    endpoints: Endpoint[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-yellow-100 text-yellow-700',
    PATCH: 'bg-orange-100 text-orange-700',
    DELETE: 'bg-red-100 text-red-700',
};

export default function ApiDetailPage() {
    const params = useParams();
    const router = useRouter();
    const apiId = params.id as string;

    const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'details' | 'endpoints' | 'auth'>('details');
    const [editMode, setEditMode] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [authType, setAuthType] = useState<'none' | 'apiKey' | 'bearer' | 'basic'>('none');
    const [authConfig, setAuthConfig] = useState<Record<string, string>>({});

    // Endpoint form
    const [showEndpointForm, setShowEndpointForm] = useState(false);
    const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);
    const [endpointPath, setEndpointPath] = useState('');
    const [endpointMethod, setEndpointMethod] = useState<Endpoint['method']>('GET');
    const [endpointSummary, setEndpointSummary] = useState('');
    const [endpointDescription, setEndpointDescription] = useState('');

    useEffect(() => {
        fetchApi();
    }, [apiId]);

    const fetchApi = async () => {
        try {
            const response = await apiClient.get<ApiConfig>(`/api/apis/${apiId}`);
            setApiConfig(response);
            setName(response.name);
            setDescription(response.description || '');
            setBaseUrl(response.baseUrl);
            setAuthType(response.authentication.type);
            setAuthConfig(response.authentication.config || {});
        } catch (err) {
            setError('Failed to load API');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const response = await apiClient.patch<ApiConfig>(`/api/apis/${apiId}`, {
                name,
                description: description || undefined,
                baseUrl,
                authentication: {
                    type: authType,
                    config: authType !== 'none' ? authConfig : undefined,
                },
            });
            setApiConfig(response);
            setEditMode(false);
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError(error.message || 'Failed to save API');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async () => {
        if (!apiConfig) return;

        try {
            const response = await apiClient.patch<ApiConfig>(`/api/apis/${apiId}`, {
                isActive: !apiConfig.isActive,
            });
            setApiConfig(response);
        } catch (err) {
            console.error('Failed to toggle API status', err);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this API? This action cannot be undone.')) {
            return;
        }

        try {
            await apiClient.delete(`/api/apis/${apiId}`);
            router.push('/dashboard/apis');
        } catch (err) {
            console.error('Failed to delete API', err);
        }
    };

    const handleAddEndpoint = async () => {
        if (!endpointPath || !endpointSummary) return;

        setSaving(true);
        try {
            const response = await apiClient.post<ApiConfig>(`/api/apis/${apiId}/endpoints`, {
                path: endpointPath,
                method: endpointMethod,
                summary: endpointSummary,
                description: endpointDescription || undefined,
                isActive: true,
            });
            setApiConfig(response);
            resetEndpointForm();
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError(error.message || 'Failed to add endpoint');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateEndpoint = async () => {
        if (!editingEndpoint || !endpointPath || !endpointSummary) return;

        setSaving(true);
        try {
            const response = await apiClient.patch<ApiConfig>(
                `/api/apis/${apiId}/endpoints/${editingEndpoint.id}`,
                {
                    path: endpointPath,
                    method: endpointMethod,
                    summary: endpointSummary,
                    description: endpointDescription || undefined,
                }
            );
            setApiConfig(response);
            resetEndpointForm();
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError(error.message || 'Failed to update endpoint');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEndpoint = async (endpointId: string) => {
        if (!confirm('Are you sure you want to delete this endpoint?')) return;

        try {
            const response = await apiClient.delete<ApiConfig>(`/api/apis/${apiId}/endpoints/${endpointId}`);
            setApiConfig(response);
        } catch (err) {
            console.error('Failed to delete endpoint', err);
        }
    };

    const handleToggleEndpoint = async (endpoint: Endpoint) => {
        try {
            const response = await apiClient.patch<ApiConfig>(`/api/apis/${apiId}/endpoints/${endpoint.id}`, {
                isActive: !endpoint.isActive,
            });
            setApiConfig(response);
        } catch (err) {
            console.error('Failed to toggle endpoint', err);
        }
    };

    const startEditEndpoint = (endpoint: Endpoint) => {
        setEditingEndpoint(endpoint);
        setEndpointPath(endpoint.path);
        setEndpointMethod(endpoint.method);
        setEndpointSummary(endpoint.summary);
        setEndpointDescription(endpoint.description || '');
        setShowEndpointForm(true);
    };

    const resetEndpointForm = () => {
        setShowEndpointForm(false);
        setEditingEndpoint(null);
        setEndpointPath('');
        setEndpointMethod('GET');
        setEndpointSummary('');
        setEndpointDescription('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    if (!apiConfig) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">API not found</p>
                <Link href="/dashboard/apis" className="text-sky-600 hover:underline">
                    Back to APIs
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/apis"
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{apiConfig.name}</h1>
                        <p className="text-sm text-gray-500">{apiConfig.baseUrl}</p>
                    </div>
                    <span
                        className={`px-2 py-1 text-xs rounded-full ${apiConfig.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        {apiConfig.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleActive}
                        className={`px-4 py-2 text-sm rounded-lg ${apiConfig.isActive
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                    >
                        {apiConfig.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-8">
                    {(['details', 'endpoints', 'auth'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                ? 'border-sky-600 text-sky-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'auth' ? 'Authentication' : tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">API Details</h2>
                        {!editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {editMode ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Base URL *
                                </label>
                                <input
                                    type="url"
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    placeholder="https://api.example.com/v1"
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !name || !baseUrl}
                                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setName(apiConfig.name);
                                        setDescription(apiConfig.description || '');
                                        setBaseUrl(apiConfig.baseUrl);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500">Name</dt>
                                <dd className="text-gray-900">{apiConfig.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Description</dt>
                                <dd className="text-gray-900">{apiConfig.description || 'No description'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Base URL</dt>
                                <dd className="text-gray-900 font-mono text-sm">{apiConfig.baseUrl}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Created</dt>
                                <dd className="text-gray-900">
                                    {new Date(apiConfig.createdAt).toLocaleDateString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Last Updated</dt>
                                <dd className="text-gray-900">
                                    {new Date(apiConfig.updatedAt).toLocaleDateString()}
                                </dd>
                            </div>
                        </dl>
                    )}
                </div>
            )}

            {/* Endpoints Tab */}
            {activeTab === 'endpoints' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">
                            Endpoints ({apiConfig.endpoints.length})
                        </h2>
                        <button
                            onClick={() => setShowEndpointForm(true)}
                            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm"
                        >
                            Add Endpoint
                        </button>
                    </div>

                    {/* Endpoint Form */}
                    {showEndpointForm && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
                            <h3 className="font-medium mb-4">
                                {editingEndpoint ? 'Edit Endpoint' : 'New Endpoint'}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Path *
                                    </label>
                                    <input
                                        type="text"
                                        value={endpointPath}
                                        onChange={(e) => setEndpointPath(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                        placeholder="/users/{id}"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Method
                                    </label>
                                    <select
                                        value={endpointMethod}
                                        onChange={(e) => setEndpointMethod(e.target.value as Endpoint['method'])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    >
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="PATCH">PATCH</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Summary *
                                    </label>
                                    <input
                                        type="text"
                                        value={endpointSummary}
                                        onChange={(e) => setEndpointSummary(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                        placeholder="Brief description of what this endpoint does"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={endpointDescription}
                                        onChange={(e) => setEndpointDescription(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                        placeholder="Detailed description (optional)"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={editingEndpoint ? handleUpdateEndpoint : handleAddEndpoint}
                                    disabled={saving || !endpointPath || !endpointSummary}
                                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 text-sm"
                                >
                                    {saving ? 'Saving...' : editingEndpoint ? 'Update' : 'Add'}
                                </button>
                                <button
                                    onClick={resetEndpointForm}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Endpoints List */}
                    {apiConfig.endpoints.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500 mb-2">No endpoints configured</p>
                            <p className="text-sm text-gray-400">
                                Add endpoints to let the AI call your API
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {apiConfig.endpoints.map((endpoint) => (
                                <div
                                    key={endpoint.id}
                                    className={`bg-white rounded-lg border border-gray-200 p-4 ${!endpoint.isActive ? 'opacity-60' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded ${methodColors[endpoint.method]
                                                    }`}
                                            >
                                                {endpoint.method}
                                            </span>
                                            <span className="font-mono text-sm">{endpoint.path}</span>
                                            {!endpoint.isActive && (
                                                <span className="text-xs text-gray-500">(Disabled)</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleEndpoint(endpoint)}
                                                className={`text-sm ${endpoint.isActive
                                                    ? 'text-yellow-600 hover:text-yellow-700'
                                                    : 'text-green-600 hover:text-green-700'
                                                    }`}
                                            >
                                                {endpoint.isActive ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                onClick={() => startEditEndpoint(endpoint)}
                                                className="text-sm text-sky-600 hover:text-sky-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEndpoint(endpoint.id)}
                                                className="text-sm text-red-600 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">{endpoint.summary}</p>
                                    {endpoint.description && (
                                        <p className="text-sm text-gray-500 mt-1">{endpoint.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Authentication Tab */}
            {activeTab === 'auth' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Authentication Settings</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Authentication Type
                            </label>
                            <select
                                value={authType}
                                onChange={(e) => {
                                    setAuthType(e.target.value as typeof authType);
                                    setAuthConfig({});
                                }}
                                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="none">None</option>
                                <option value="apiKey">API Key</option>
                                <option value="bearer">Bearer Token</option>
                                <option value="basic">Basic Auth</option>
                            </select>
                        </div>

                        {authType === 'apiKey' && (
                            <div className="space-y-4 pt-4 border-t">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Header Name
                                    </label>
                                    <input
                                        type="text"
                                        value={authConfig.headerName || ''}
                                        onChange={(e) => setAuthConfig({ ...authConfig, headerName: e.target.value })}
                                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="X-API-Key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        API Key Value
                                    </label>
                                    <input
                                        type="password"
                                        value={authConfig.apiKey || ''}
                                        onChange={(e) => setAuthConfig({ ...authConfig, apiKey: e.target.value })}
                                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Enter API key"
                                    />
                                </div>
                            </div>
                        )}

                        {authType === 'bearer' && (
                            <div className="pt-4 border-t">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bearer Token
                                </label>
                                <input
                                    type="password"
                                    value={authConfig.token || ''}
                                    onChange={(e) => setAuthConfig({ ...authConfig, token: e.target.value })}
                                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter bearer token"
                                />
                            </div>
                        )}

                        {authType === 'basic' && (
                            <div className="space-y-4 pt-4 border-t">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={authConfig.username || ''}
                                        onChange={(e) => setAuthConfig({ ...authConfig, username: e.target.value })}
                                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={authConfig.password || ''}
                                        onChange={(e) => setAuthConfig({ ...authConfig, password: e.target.value })}
                                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        )}

                        {authType !== 'none' && (
                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Authentication'}
                                </button>
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Security Note:</strong> Authentication credentials are encrypted before storage.
                                The AI will use these credentials when making API calls on behalf of your users.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
