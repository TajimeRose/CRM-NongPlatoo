// TypeScript interfaces for database tables

export interface User {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
    role: 'user' | 'admin' | 'moderator';
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    last_login?: string;
    // Computed fields for display
    name?: string;
    status?: 'active' | 'inactive' | 'banned';
}

export interface Place {
    id?: number;
    place_id?: string;
    name: string;
    description?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    category?: string;
    opening_hours?: string;
    price_range?: string;
    price_min?: number;
    price_max?: number;
    rating?: number;
    image_url?: string;
    image_urls?: string;  // Legacy field for backward compatibility
    google_maps_link?: string;
    attraction_type?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    // Promotion fields (may need to add to DB)
    is_promoted?: boolean;
    promoted_score?: number;
    promotion_expiry?: string;
    views?: number;
}

// Type for creating a new place (id is optional)
export interface CreatePlace {
    name: string;
    description?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    category?: string;
    opening_hours?: string;
    price_range?: string;
    price_min?: number;
    price_max?: number;
    rating?: number;
    rating?: number;
    image_url?: string;
    google_maps_link?: string;
    attraction_type?: string;
    is_active?: boolean;
}

// Pagination data structure
export interface PaginationData {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
}

// Response from GET /api/places
export interface PlacesResponse {
    data: Place[];
    pagination: PaginationData;
}

// CSV validation result
export interface CSVValidationResult {
    validRows: Partial<Place>[];
    invalidRows: Array<{
        rowNumber: number;
        data: Record<string, string>;
        errors: string[];
    }>;
    totalRows: number;
}

export interface ChatLog {
    id: number;
    user_id?: number;
    session_id?: string;
    user_message: string;
    ai_response: string;
    model_name?: string;
    tokens_used?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    latency_ms?: number;
    intent_type?: 'travel' | 'restaurant' | 'general';
    data_source?: 'database' | 'gpt' | 'fallback';
    created_at: string;
    // Joined fields
    user_name?: string;
    user_email?: string;
}

export interface ChatHistory {
    id: number;
    userId: number;
    userName: string;
    messages: ChatMessage[];
    tokensUsed: number;
    createdAt: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface UserActivityLog {
    id: number;
    user_id?: string;
    action_type: string;
    target_element?: string;
    page_url?: string;
    meta_data?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

export interface MessageFeedback {
    id: number;
    message_id: string;
    user_id: string;
    user_message?: string;
    ai_response?: string;
    feedback_type: 'like' | 'dislike';
    feedback_comment?: string;
    intent?: string;
    source?: string;
    created_at: string;
}

export interface SecurityLog {
    id: number;
    ip: string;
    action: string;
    count: number;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    blocked: boolean;
}

export interface SystemConfig {
    id: number;
    key: string;
    value: string;
    description: string;
    category: string;
}

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalPageViews: number;
    aiQueries: number;
    avgSessionDuration: string;
    bounceRate: number;
}

export interface TrafficData {
    hour: string;
    users: number;
}

export interface PageViewData {
    page: string;
    views: number;
}

export interface BrowserStats {
    name: string;
    value: number;
    fill: string;
}

export interface AiUsageData {
    date: string;
    queries: number;
    tokens: number;
}
