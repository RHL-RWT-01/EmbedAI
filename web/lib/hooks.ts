import useSWR from 'swr';
import apiClient from './api';

// Generic fetcher
const fetcher = async <T>(url: string): Promise<T> => {
    // This is a simple approach - the URL is just used as a key
    // The actual fetching is done through apiClient methods
    throw new Error('Use specific hooks with apiClient');
};

// Analytics hooks
export function useAnalyticsOverview(period: 'day' | 'week' | 'month' = 'week') {
    return useSWR(
        ['analytics-overview', period],
        () => apiClient.getAnalyticsOverview(period),
        {
            refreshInterval: 60000, // Refresh every minute
            revalidateOnFocus: false,
        }
    );
}

export function useAnalyticsUsage(period: 'day' | 'week' | 'month' = 'week') {
    return useSWR(
        ['analytics-usage', period],
        () => apiClient.getAnalyticsUsage(period),
        {
            refreshInterval: 60000,
            revalidateOnFocus: false,
        }
    );
}

// APIs hooks
export function useApis(params?: { page?: number; limit?: number; isActive?: boolean }) {
    return useSWR(
        ['apis', params],
        () => apiClient.getApis(params),
        {
            revalidateOnFocus: false,
        }
    );
}

export function useApi(id: string | null) {
    return useSWR(
        id ? ['api', id] : null,
        () => apiClient.getApi(id!),
        {
            revalidateOnFocus: false,
        }
    );
}

// Conversations hooks
export function useConversations(params?: { page?: number; limit?: number }) {
    return useSWR(
        ['conversations', params],
        () => apiClient.getConversations(params),
        {
            revalidateOnFocus: false,
        }
    );
}

export function useConversation(id: string | null) {
    return useSWR(
        id ? ['conversation', id] : null,
        () => apiClient.getConversation(id!),
        {
            revalidateOnFocus: false,
        }
    );
}

export function useConversationMessages(
    id: string | null,
    params?: { page?: number; limit?: number }
) {
    return useSWR(
        id ? ['conversation-messages', id, params] : null,
        () => apiClient.getConversationMessages(id!, params),
        {
            revalidateOnFocus: false,
        }
    );
}

// Tenant hooks
export function useTenant() {
    return useSWR('tenant', () => apiClient.getTenant(), {
        revalidateOnFocus: false,
    });
}
