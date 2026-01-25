import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from './api';
import type { User, Tenant } from './types';

interface AuthState {
    user: User | null;
    tenant: Tenant | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setAuth: (data: {
        user: User;
        tenant?: Tenant | null;
        accessToken: string;
        refreshToken: string;
    }) => void;
    setTenant: (tenant: Tenant) => void;
    logout: () => void;
    checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            tenant: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: true,

            setAuth: ({ user, tenant, accessToken, refreshToken }) => {
                apiClient.setToken(accessToken);
                set({
                    user: user as User,
                    tenant: tenant as Tenant | null,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
            },

            setTenant: (tenant) => {
                set({ tenant: tenant as Tenant });
            },

            logout: () => {
                apiClient.setToken(null);
                set({
                    user: null,
                    tenant: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            checkAuth: async () => {
                const { accessToken, refreshToken: storedRefreshToken } = get();

                if (!accessToken) {
                    set({ isLoading: false });
                    return false;
                }

                apiClient.setToken(accessToken);

                try {
                    const data = await apiClient.getMe();
                    set({
                        user: data.user as unknown as User,
                        tenant: (data.tenant as unknown as Tenant) || null,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return true;
                } catch (error) {
                    // Try to refresh token
                    if (storedRefreshToken) {
                        try {
                            const tokens = await apiClient.refreshToken(storedRefreshToken);
                            apiClient.setToken(tokens.accessToken);

                            const data = await apiClient.getMe();
                            set({
                                user: data.user as unknown as User,
                                tenant: (data.tenant as unknown as Tenant) || null,
                                accessToken: tokens.accessToken,
                                refreshToken: tokens.refreshToken,
                                isAuthenticated: true,
                                isLoading: false,
                            });
                            return true;
                        } catch {
                            // Refresh failed, logout
                        }
                    }

                    set({
                        user: null,
                        tenant: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                    return false;
                }
            },
        }),
        {
            name: 'useembed-auth',
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);
