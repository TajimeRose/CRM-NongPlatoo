// Firebase API for fetching users from Firebase Admin SDK via API server

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface FirebaseUser {
    id: string;
    email: string;
    name: string;
    updatedAt?: number;
    createdAt?: string | number;
    photoURL?: string;
    role?: string;
    disabled?: boolean;
    provider?: string;
    phone?: string;
    lastLogin?: string;
}

export async function fetchFirebaseUsers(): Promise<FirebaseUser[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/firebase-users`);
        if (!response.ok) {
            throw new Error('Failed to fetch Firebase users');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching Firebase users:', error);
        return [];
    }
}

export async function resetUserPassword(uid: string): Promise<{ success: boolean; link?: string; message?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/firebase-users/${uid}/reset-password`, {
            method: 'POST'
        });
        return response.json();
    } catch (error) {
        console.error('Error resetting password:', error);
        return { success: false, message: 'Failed to reset password' };
    }
}

export async function toggleUserDisabled(uid: string, disabled: boolean): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/firebase-users/${uid}/toggle-disabled`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ disabled })
        });
        return response.json();
    } catch (error) {
        console.error('Error toggling user disabled:', error);
        return { success: false, message: 'Failed to update user' };
    }
}

export async function deleteFirebaseUser(uid: string): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/firebase-users/${uid}`, {
            method: 'DELETE'
        });
        return response.json();
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, message: 'Failed to delete user' };
    }
}

export async function syncAllUsers(): Promise<{ success: boolean; count?: number; message?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/firebase-users/sync-all`, {
            method: 'POST'
        });
        return response.json();
    } catch (error) {
        console.error('Error syncing users:', error);
        return { success: false, message: 'Failed to sync users' };
    }
}

// Get online users from Firebase presence
export async function getOnlineUsers(): Promise<{ uid: string; email: string; name: string; photoURL?: string }[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/online-users`);
        if (!response.ok) {
            return [];
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching online users:', error);
        return [];
    }
}
