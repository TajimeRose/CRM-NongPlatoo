// React Query hooks for Admin Panel data fetching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchPlaces,
    updatePlace,
    fetchChatHistories,
    fetchSecurityLogs,
    updateSecurityLog,
    fetchSystemConfigs,
    createSystemConfig,
    updateSystemConfig,
    deleteSystemConfig,
    fetchStats,
    fetchTrafficData,
    fetchPageViews,
    fetchBrowserStats,
    fetchAiUsageData,
} from '@/api';
import type { User, Place, SecurityLog, SystemConfig } from '@/api/types';

// ============ Users Hooks ============
export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
        staleTime: 30000, // 30 seconds
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: Partial<User>) => createUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: Partial<User> }) =>
            updateUser(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

// ============ Places Hooks ============
export function usePlaces() {
    return useQuery({
        queryKey: ['places'],
        queryFn: fetchPlaces,
        staleTime: 30000,
    });
}

export function useUpdatePlace() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: Partial<Place> }) =>
            updatePlace(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['places'] });
        },
    });
}

// ============ Chat Logs Hooks ============
export function useChatHistories() {
    return useQuery({
        queryKey: ['chatHistories'],
        queryFn: fetchChatHistories,
        staleTime: 30000,
    });
}

// ============ Security Logs Hooks ============
export function useSecurityLogs() {
    return useQuery({
        queryKey: ['securityLogs'],
        queryFn: fetchSecurityLogs,
        staleTime: 30000,
    });
}

export function useUpdateSecurityLog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: Partial<SecurityLog> }) =>
            updateSecurityLog(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['securityLogs'] });
        },
    });
}

// ============ System Configs Hooks ============
export function useSystemConfigs() {
    return useQuery({
        queryKey: ['systemConfigs'],
        queryFn: fetchSystemConfigs,
        staleTime: 30000,
    });
}

export function useCreateSystemConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (config: Partial<SystemConfig>) => createSystemConfig(config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['systemConfigs'] });
        },
    });
}

export function useUpdateSystemConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: Partial<SystemConfig> }) =>
            updateSystemConfig(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['systemConfigs'] });
        },
    });
}

export function useDeleteSystemConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteSystemConfig(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['systemConfigs'] });
        },
    });
}

// ============ Dashboard Stats Hooks ============
export function useStats() {
    return useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
        staleTime: 60000, // 1 minute
    });
}

export function useTrafficData() {
    return useQuery({
        queryKey: ['trafficData'],
        queryFn: fetchTrafficData,
        staleTime: 60000,
    });
}

export function usePageViews() {
    return useQuery({
        queryKey: ['pageViews'],
        queryFn: fetchPageViews,
        staleTime: 60000,
    });
}

export function useBrowserStats() {
    return useQuery({
        queryKey: ['browserStats'],
        queryFn: fetchBrowserStats,
        staleTime: 60000,
    });
}

export function useAiUsageData() {
    return useQuery({
        queryKey: ['aiUsageData'],
        queryFn: fetchAiUsageData,
        staleTime: 60000,
    });
}
