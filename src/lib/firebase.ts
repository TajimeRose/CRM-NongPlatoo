// Firebase configuration and initialization with Presence system
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getDatabase, ref, set, onValue, onDisconnect, serverTimestamp } from 'firebase/database';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: 'https://nong-platoo-default-rtdb.asia-southeast1.firebasedatabase.app'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Sync user data to Realtime Database after login
export async function syncUserToDatabase(user: User): Promise<void> {
    if (!user) return;

    const userRef = ref(database, `users/${user.uid}`);

    try {
        await set(userRef, {
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || 'Unknown',
            photoURL: user.photoURL || null,
            updatedAt: Date.now(),
            lastLogin: Date.now(),
        });
        console.log('User data synced to Realtime Database:', user.uid);
    } catch (error) {
        console.error('Error syncing user to database:', error);
    }
}

// Setup presence system to track online users
export function setupPresence(user: User): void {
    if (!user) return;

    const uid = user.uid;
    const userStatusRef = ref(database, `presence/${uid}`);
    const connectedRef = ref(database, '.info/connected');

    // User data for presence
    const isOnlineData = {
        online: true,
        lastSeen: Date.now(),
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'Unknown',
        photoURL: user.photoURL || null
    };

    const isOfflineData = {
        online: false,
        lastSeen: Date.now()
    };

    // Listen for connection state
    onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) {
            return;
        }

        // When user disconnects, set offline status
        onDisconnect(userStatusRef).set(isOfflineData).then(() => {
            // Set user as online
            set(userStatusRef, isOnlineData);
        });
    });

    console.log('Presence system initialized for user:', uid);
}

// Listen for auth state changes, sync to database, and setup presence
export function initAuthStateListener(): void {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            syncUserToDatabase(user);
            setupPresence(user);
        }
    });
}

// Get online users count (for admin dashboard)
export function subscribeToOnlineUsers(callback: (users: any[]) => void): () => void {
    const presenceRef = ref(database, 'presence');

    const unsubscribe = onValue(presenceRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            callback([]);
            return;
        }

        // Filter only online users
        const onlineUsers = Object.entries(data)
            .filter(([_, userData]: [string, any]) => userData.online === true)
            .map(([uid, userData]: [string, any]) => ({
                uid,
                ...userData
            }));

        callback(onlineUsers);
    });

    return unsubscribe;
}

export default app;
