// API client for Admin Panel database operations

import type {
    User,
    Place,
    ChatLog,
    ChatHistory,
    SecurityLog,
    SystemConfig,
    DashboardStats,
    TrafficData,
    PageViewData,
    BrowserStats,
    AiUsageData,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

// Generic fetch wrapper with error handling
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// ============ Users API ============
export async function fetchUsers(): Promise<User[]> {
    return apiFetch<User[]>('/users');
}

export async function createUser(user: Partial<User>): Promise<User> {
    return apiFetch<User>('/users', {
        method: 'POST',
        body: JSON.stringify(user),
    });
}

export async function updateUser(id: number, updates: Partial<User>): Promise<User> {
    return apiFetch<User>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

export async function deleteUser(id: number): Promise<void> {
    return apiFetch<void>(`/users/${id}`, {
        method: 'DELETE',
    });
}

// ============ Places API ============
export async function fetchPlaces(): Promise<Place[]> {
    return apiFetch<Place[]>('/places');
}

export async function updatePlace(id: number, updates: Partial<Place>): Promise<Place> {
    return apiFetch<Place>(`/places/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

// ============ Chat Logs API ============
export async function fetchChatLogs(): Promise<ChatLog[]> {
    return apiFetch<ChatLog[]>('/chat-logs');
}

export async function fetchChatHistories(): Promise<ChatHistory[]> {
    return apiFetch<ChatHistory[]>('/chat-histories');
}

// ============ Security Logs API ============
export async function fetchSecurityLogs(): Promise<SecurityLog[]> {
    return apiFetch<SecurityLog[]>('/security-logs');
}

export async function updateSecurityLog(id: number, updates: Partial<SecurityLog>): Promise<SecurityLog> {
    return apiFetch<SecurityLog>(`/security-logs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

// ============ System Configs API ============
export async function fetchSystemConfigs(): Promise<SystemConfig[]> {
    return apiFetch<SystemConfig[]>('/system-configs');
}

export async function createSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
    return apiFetch<SystemConfig>('/system-configs', {
        method: 'POST',
        body: JSON.stringify(config),
    });
}

export async function updateSystemConfig(id: number, updates: Partial<SystemConfig>): Promise<SystemConfig> {
    return apiFetch<SystemConfig>(`/system-configs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

export async function deleteSystemConfig(id: number): Promise<void> {
    return apiFetch<void>(`/system-configs/${id}`, {
        method: 'DELETE',
    });
}

// ============ Dashboard Stats API ============
export async function fetchStats(): Promise<DashboardStats> {
    return apiFetch<DashboardStats>('/stats');
}

export async function fetchTrafficData(): Promise<TrafficData[]> {
    return apiFetch<TrafficData[]>('/stats/traffic');
}

export async function fetchPageViews(): Promise<PageViewData[]> {
    return apiFetch<PageViewData[]>('/stats/page-views');
}

export async function fetchBrowserStats(): Promise<BrowserStats[]> {
    return apiFetch<BrowserStats[]>('/stats/browsers');
}

export async function fetchAiUsageData(): Promise<AiUsageData[]> {
    return apiFetch<AiUsageData[]>('/stats/ai-usage');
}
