// Places API client for Admin Panel
// Full-featured Places Management API with pagination, filtering, sorting, CRUD, bulk operations, and CSV import

import type { Place, PaginationData, PlacesResponse, CSVValidationResult, CreatePlace } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
function getAuthToken(): string | null {
    return localStorage.getItem('admin_token');
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            // Redirect to login if unauthorized
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// ============ Places API ============

export interface GetPlacesParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'id' | 'name' | 'category' | 'rating' | 'created_at' | 'updated_at';
    sortOrder?: 'ASC' | 'DESC';
    category?: string;
    activeFilter?: 'active' | 'inactive' | '';
    minRating?: string;
}

/**
 * ดึงรายการสถานที่พร้อม pagination, filtering, sorting
 */
export async function getPlaces(params: GetPlacesParams = {}): Promise<PlacesResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.search) queryParams.set('search', params.search);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    if (params.category) queryParams.set('category', params.category);
    if (params.activeFilter) queryParams.set('activeFilter', params.activeFilter);
    if (params.minRating) queryParams.set('minRating', params.minRating);

    const queryString = queryParams.toString();
    return apiFetch<PlacesResponse>(`/places${queryString ? `?${queryString}` : ''}`);
}

/**
 * ดึงสถานที่ตาม ID
 */
export async function getPlace(id: number): Promise<Place> {
    return apiFetch<Place>(`/places/${id}`);
}

/**
 * สร้างสถานที่ใหม่
 */
export async function createPlace(place: CreatePlace): Promise<Place> {
    return apiFetch<Place>('/places', {
        method: 'POST',
        body: JSON.stringify(place),
    });
}

/**
 * อัปเดตสถานที่
 */
export async function updatePlace(id: number, updates: Partial<Place>): Promise<Place> {
    return apiFetch<Place>(`/places/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

/**
 * ลบสถานที่
 */
export async function deletePlace(id: number): Promise<{ success: boolean; deletedId: number }> {
    return apiFetch<{ success: boolean; deletedId: number }>(`/places/${id}`, {
        method: 'DELETE',
    });
}

/**
 * ลบหลายสถานที่
 */
export async function bulkDeletePlaces(ids: number[]): Promise<{
    success: boolean;
    deletedCount: number;
    deletedIds: number[];
}> {
    return apiFetch('/places/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
    });
}

/**
 * อัปเดตหลายสถานที่
 */
export async function bulkUpdatePlaces(updates: Array<{ id: number } & Partial<Place>>): Promise<{
    success: boolean;
    updatedCount: number;
    updatedPlaces: Place[];
}> {
    return apiFetch('/places/bulk/update', {
        method: 'PUT',
        body: JSON.stringify({ updates }),
    });
}

/**
 * อัปโหลด CSV และ validate
 */
export async function uploadCSV(
    file: File,
    columnMapping: Record<string, string>
): Promise<{
    validation: CSVValidationResult;
    columnNames: string[];
    fileName: string;
}> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('columnMapping', JSON.stringify(columnMapping));

    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/places/csv/upload`, {
        method: 'POST',
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * นำเข้าข้อมูล CSV ที่ validated แล้ว
 */
export async function importCSV(validRows: Partial<Place>[]): Promise<{
    success: boolean;
    insertedCount: number;
    insertedPlaces: Place[];
}> {
    return apiFetch('/places/csv/import', {
        method: 'POST',
        body: JSON.stringify({ validRows }),
    });
}

/**
 * สร้าง Proxy URL สำหรับรูปภาพ
 */
export function getProxyImageUrl(originalUrl: string): string {
    if (!originalUrl) return '';

    // Check if already a proxy URL
    if (originalUrl.includes('/api/proxy/image')) {
        return originalUrl;
    }

    // Check if needs proxying (Google images)
    const needsProxy = [
        'lh3.googleusercontent.com',
        'maps.googleapis.com',
        'maps.gstatic.com',
        'googleusercontent.com'
    ].some(domain => originalUrl.includes(domain));

    if (needsProxy) {
        return `${API_BASE_URL}/proxy/image?url=${encodeURIComponent(originalUrl)}`;
    }

    return originalUrl;
}

// Export PlacesAPI class for backward compatibility
export class PlacesAPI {
    private token: string | null = null;

    constructor() {
        this.token = localStorage.getItem('admin_token');
    }

    setToken(token: string): void {
        this.token = token;
        localStorage.setItem('admin_token', token);
    }

    getPlaces = getPlaces;
    getPlace = getPlace;
    createPlace = createPlace;
    updatePlace = updatePlace;
    deletePlace = deletePlace;
    bulkDeletePlaces = bulkDeletePlaces;
    bulkUpdatePlaces = bulkUpdatePlaces;
    uploadCSV = uploadCSV;
    importCSV = importCSV;
    getProxyImageUrl = getProxyImageUrl;
}

export const placesAPI = new PlacesAPI();
export default placesAPI;
