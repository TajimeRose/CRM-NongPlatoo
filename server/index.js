// Express.js API Server for CRM Admin Panel
// Connects to PostgreSQL database and provides REST endpoints

import express from 'express';
import cors from 'cors';
import pg from 'pg';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase Admin SDK
let firebaseAdmin = null;
try {
    const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://nong-platoo-default-rtdb.asia-southeast1.firebasedatabase.app'
    });
    firebaseAdmin = admin;
    console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
    console.warn('⚠️ Firebase Admin SDK not initialized:', error.message);
    console.warn('   Firebase user management features will be disabled');
}

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:PdQ0GiGzLIVN0VcY2tKSZtYqm7iiUMCEY7nLZghPF5DcZnZsXNhGtD1HJgjrqnRr@38.242.132.39:8900/postgres',
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ Users API ============
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        id, 
        email, 
        username,
        COALESCE(first_name || ' ' || last_name, username) as name,
        role,
        CASE 
          WHEN is_active = false THEN 'inactive'
          ELSE 'active'
        END as status,
        TO_CHAR(last_login, 'YYYY-MM-DD HH24:MI') as "lastLogin",
        TO_CHAR(created_at, 'YYYY-MM-DD') as "createdAt"
      FROM users 
      ORDER BY created_at DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, role = 'user' } = req.body;
        const username = email.split('@')[0];
        const result = await pool.query(
            `INSERT INTO users (email, username, password_hash, first_name, role, is_active) 
       VALUES ($1, $2, $3, $4, $5, true) 
       RETURNING *`,
            [email, username, 'temporary_hash', name, role]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, is_active } = req.body;

        let query = 'UPDATE users SET updated_at = NOW()';
        const params = [];
        let paramIndex = 1;

        if (role !== undefined) {
            query += `, role = $${paramIndex++}`;
            params.push(role);
        }
        if (is_active !== undefined) {
            query += `, is_active = $${paramIndex++}`;
            params.push(is_active);
        }

        query += ` WHERE id = $${paramIndex} RETURNING *`;
        params.push(id);

        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// ============ Places API ============
app.get('/api/places', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        id,
        name,
        COALESCE(category, attraction_type, 'ทั่วไป') as category,
        description,
        0 as views,
        false as "isPromoted",
        0 as "promotedScore",
        NULL as "promotionExpiry"
      FROM places 
      ORDER BY name
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ message: 'Failed to fetch places' });
    }
});

app.put('/api/places/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description } = req.body;
        const result = await pool.query(
            `UPDATE places SET name = COALESCE($1, name), category = COALESCE($2, category), description = COALESCE($3, description)
       WHERE id = $4 RETURNING *`,
            [name, category, description, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating place:', error);
        res.status(500).json({ message: 'Failed to update place' });
    }
});

// ============ Chat Logs API ============
app.get('/api/chat-logs', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        id,
        user_id,
        session_id,
        user_message,
        ai_response,
        model_name,
        tokens_used,
        intent_type,
        data_source,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as "createdAt"
      FROM chat_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching chat logs:', error);
        res.status(500).json({ message: 'Failed to fetch chat logs' });
    }
});

// Get chat histories grouped by user/session
app.get('/api/chat-histories', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        cl.id,
        cl.user_id as "userId",
        COALESCE(u.username, 'Anonymous User ' || COALESCE(cl.session_id::text, cl.id::text)) as "userName",
        cl.tokens_used as "tokensUsed",
        TO_CHAR(cl.created_at, 'YYYY-MM-DD HH24:MI') as "createdAt",
        cl.user_message,
        cl.ai_response
      FROM chat_logs cl
      LEFT JOIN users u ON cl.user_id = u.id
      ORDER BY cl.created_at DESC
      LIMIT 50
    `);

        // Transform to chat history format with messages array
        const histories = result.rows.map(row => ({
            id: row.id,
            userId: row.userId,
            userName: row.userName,
            tokensUsed: row.tokensUsed || 0,
            createdAt: row.createdAt,
            messages: [
                { role: 'user', content: row.user_message, timestamp: row.createdAt },
                { role: 'assistant', content: row.ai_response, timestamp: row.createdAt }
            ]
        }));

        res.json(histories);
    } catch (error) {
        console.error('Error fetching chat histories:', error);
        res.status(500).json({ message: 'Failed to fetch chat histories' });
    }
});

// ============ Security Logs API ============
// Note: This table may not exist yet, returning mock data if query fails
app.get('/api/security-logs', async (req, res) => {
    try {
        // Try to query security_logs table
        const result = await pool.query(`
      SELECT 
        id,
        ip_address as ip,
        action,
        count,
        severity,
        is_blocked as blocked,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as timestamp
      FROM security_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Security logs table may not exist, returning empty:', error.message);
        // Return empty array if table doesn't exist
        res.json([]);
    }
});

app.put('/api/security-logs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { blocked } = req.body;
        const result = await pool.query(
            'UPDATE security_logs SET is_blocked = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [blocked, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating security log:', error);
        res.status(500).json({ message: 'Failed to update security log' });
    }
});

// ============ System Configs API ============
// Note: This table may not exist yet
app.get('/api/system-configs', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT id, key, value, description, category
      FROM system_configs 
      ORDER BY category, key
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('System configs table may not exist, returning empty:', error.message);
        res.json([]);
    }
});

app.post('/api/system-configs', async (req, res) => {
    try {
        const { key, value, description, category } = req.body;
        const result = await pool.query(
            `INSERT INTO system_configs (key, value, description, category) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [key, value, description || '', category || 'System']
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating system config:', error);
        res.status(500).json({ message: 'Failed to create system config' });
    }
});

app.put('/api/system-configs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { value } = req.body;
        const result = await pool.query(
            'UPDATE system_configs SET value = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [value, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating system config:', error);
        res.status(500).json({ message: 'Failed to update system config' });
    }
});

app.delete('/api/system-configs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM system_configs WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting system config:', error);
        res.status(500).json({ message: 'Failed to delete system config' });
    }
});

// ============ Dashboard Stats API ============
app.get('/api/stats', async (req, res) => {
    try {
        // Get total users
        const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
        const totalUsers = parseInt(usersResult.rows[0].count) || 0;

        // Get active users (logged in last 30 days)
        const activeUsersResult = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE last_login > NOW() - INTERVAL '30 days'
    `);
        const activeUsers = parseInt(activeUsersResult.rows[0].count) || 0;

        // Get total page views from activity logs
        // Add 1000 offset for historical data before database tracking
        const PAGE_VIEWS_OFFSET = 1000;
        const pageViewsResult = await pool.query(`
      SELECT COUNT(*) as count FROM user_activity_logs 
      WHERE action_type = 'page_view'
    `);
        const totalPageViews = (parseInt(pageViewsResult.rows[0].count) || 0) + PAGE_VIEWS_OFFSET;

        // Get AI queries count
        const aiQueriesResult = await pool.query('SELECT COUNT(*) as count FROM chat_logs');
        const aiQueries = parseInt(aiQueriesResult.rows[0].count) || 0;

        res.json({
            totalUsers,
            activeUsers,
            totalPageViews,
            aiQueries,
            avgSessionDuration: '4m 32s', // Would need session tracking to calculate
            bounceRate: 32.4 // Would need analytics to calculate
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
});

app.get('/api/stats/traffic', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'HH24:00') as hour,
        COUNT(DISTINCT COALESCE(user_id, ip_address)) as users
      FROM user_activity_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY TO_CHAR(created_at, 'HH24:00')
      ORDER BY hour
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching traffic data:', error);
        res.json([]); // Return empty array if fails
    }
});

app.get('/api/stats/page-views', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        page_url as page,
        COUNT(*) as views
      FROM user_activity_logs
      WHERE action_type = 'page_view'
      GROUP BY page_url
      ORDER BY views DESC
      LIMIT 10
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching page views:', error);
        res.json([]);
    }
});

app.get('/api/stats/browsers', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        CASE 
          -- Social Media Apps (check first as they embed webviews)
          WHEN user_agent ILIKE '%FBAN%' OR user_agent ILIKE '%FBAV%' THEN 'Facebook App'
          WHEN user_agent ILIKE '%Instagram%' THEN 'Instagram'
          WHEN user_agent ILIKE '%Line/%' OR user_agent ILIKE '%LIFF%' THEN 'LINE'
          WHEN user_agent ILIKE '%Twitter%' OR user_agent ILIKE '%TwitterAndroid%' THEN 'Twitter/X'
          WHEN user_agent ILIKE '%TikTok%' OR user_agent ILIKE '%BytedanceWebview%' THEN 'TikTok'
          WHEN user_agent ILIKE '%Snapchat%' THEN 'Snapchat'
          WHEN user_agent ILIKE '%Pinterest%' THEN 'Pinterest'
          -- Desktop Browsers
          WHEN user_agent ILIKE '%Edg/%' OR user_agent ILIKE '%Edge/%' THEN 'Microsoft Edge'
          WHEN user_agent ILIKE '%OPR/%' OR user_agent ILIKE '%Opera%' THEN 'Opera'
          WHEN user_agent ILIKE '%Firefox%' THEN 'Firefox'
          WHEN user_agent ILIKE '%Chrome%' AND user_agent NOT ILIKE '%Edg%' AND user_agent NOT ILIKE '%OPR%' THEN 'Chrome'
          WHEN user_agent ILIKE '%Safari%' AND user_agent NOT ILIKE '%Chrome%' THEN 'Safari'
          -- Mobile Browsers
          WHEN user_agent ILIKE '%SamsungBrowser%' THEN 'Samsung Internet'
          WHEN user_agent ILIKE '%UCBrowser%' OR user_agent ILIKE '%UCWEB%' THEN 'UC Browser'
          WHEN user_agent ILIKE '%MiuiBrowser%' THEN 'Xiaomi Browser'
          WHEN user_agent ILIKE '%HuaweiBrowser%' THEN 'Huawei Browser'
          WHEN user_agent ILIKE '%Brave%' THEN 'Brave'
          -- Bots (optional - can filter out)
          WHEN user_agent ILIKE '%Googlebot%' OR user_agent ILIKE '%bingbot%' OR user_agent ILIKE '%bot%' THEN 'Bots'
          -- WebView (generic)
          WHEN user_agent ILIKE '%wv)%' OR user_agent ILIKE '%WebView%' THEN 'WebView (App)'
          -- Null = Unknown
          WHEN user_agent IS NULL THEN 'อื่นๆ'
          ELSE 'อื่นๆ'
        END as name,
        COUNT(*) as value
      FROM user_activity_logs
      GROUP BY 1
      ORDER BY value DESC
    `);

        const colors = {
            'Chrome': 'hsl(210, 100%, 50%)',
            'Safari': 'hsl(220, 90%, 56%)',
            'Firefox': 'hsl(24, 100%, 50%)',
            'LINE': 'hsl(145, 63%, 42%)',
            'Facebook App': 'hsl(220, 46%, 48%)',
            'Instagram': 'hsl(340, 75%, 54%)',
            'TikTok': 'hsl(0, 0%, 0%)',
            'Twitter/X': 'hsl(203, 89%, 53%)',
            'Samsung Internet': 'hsl(230, 60%, 50%)',
            'Microsoft Edge': 'hsl(200, 100%, 40%)',
            'Opera': 'hsl(0, 80%, 50%)',
            'UC Browser': 'hsl(30, 100%, 50%)',
            'WebView (App)': 'hsl(280, 60%, 50%)',
            'Brave': 'hsl(15, 100%, 55%)',
            'Xiaomi Browser': 'hsl(25, 100%, 50%)',
            'Huawei Browser': 'hsl(0, 70%, 45%)',
            'Bots': 'hsl(0, 0%, 60%)',
            'Snapchat': 'hsl(55, 100%, 50%)',
            'Pinterest': 'hsl(0, 70%, 45%)',
            'อื่นๆ': 'hsl(var(--muted))'
        };

        const data = result.rows.map(row => ({
            name: row.name,
            value: parseInt(row.value),
            fill: colors[row.name] || 'hsl(var(--muted))'
        }));

        res.json(data);
    } catch (error) {
        console.error('Error fetching browser stats:', error);
        res.json([]);
    }
});

app.get('/api/stats/ai-usage', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        CASE EXTRACT(DOW FROM created_at)
          WHEN 0 THEN 'อาทิตย์'
          WHEN 1 THEN 'จันทร์'
          WHEN 2 THEN 'อังคาร'
          WHEN 3 THEN 'พุธ'
          WHEN 4 THEN 'พฤหัส'
          WHEN 5 THEN 'ศุกร์'
          WHEN 6 THEN 'เสาร์'
        END as date,
        COUNT(*) as queries,
        COALESCE(SUM(tokens_used), 0) as tokens,
        DATE(created_at) as sort_date
      FROM chat_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY EXTRACT(DOW FROM created_at), DATE(created_at)
      ORDER BY sort_date
    `);
        // Remove sort_date from response
        const data = result.rows.map(row => ({
            date: row.date,
            queries: parseInt(row.queries) || 0,
            tokens: parseInt(row.tokens) || 0
        }));
        res.json(data);
    } catch (error) {
        console.error('Error fetching AI usage data:', error);
        res.json([]);
    }
});

// ============ Firebase Auth Users API (Admin SDK) ============
// List all Firebase Auth users
app.get('/api/firebase-users', async (req, res) => {
    try {
        if (!firebaseAdmin) {
            // Fallback to Realtime Database if Admin SDK not available
            const FIREBASE_DB_URL = 'https://nong-platoo-default-rtdb.asia-southeast1.firebasedatabase.app';
            const response = await fetch(`${FIREBASE_DB_URL}/users.json`);
            const data = await response.json();

            if (!data) return res.json([]);

            const users = Object.entries(data).map(([id, userData]) => ({
                id,
                email: userData.email || '',
                name: userData.name || userData.displayName || 'Unknown',
                updatedAt: userData.updatedAt,
                createdAt: userData.createdAt || userData.updatedAt,
                photoURL: userData.photoURL,
                role: userData.role || 'user',
                disabled: false,
                provider: 'email'
            }));
            return res.json(users);
        }

        // Use Firebase Admin SDK to list all auth users
        const listUsersResult = await firebaseAdmin.auth().listUsers(1000);

        const users = listUsersResult.users.map(user => ({
            id: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || 'Unknown',
            photoURL: user.photoURL || null,
            createdAt: user.metadata.creationTime,
            lastLogin: user.metadata.lastSignInTime,
            disabled: user.disabled || false,
            provider: user.providerData?.[0]?.providerId || 'email',
            phone: user.phoneNumber || null,
            role: 'user'
        }));

        res.json(users);
    } catch (error) {
        console.error('Error fetching Firebase users:', error);
        res.status(500).json({ message: 'Failed to fetch Firebase users' });
    }
});

// Reset user password (send reset email)
app.post('/api/firebase-users/:uid/reset-password', async (req, res) => {
    try {
        if (!firebaseAdmin) {
            return res.status(503).json({ message: 'Firebase Admin SDK not available' });
        }

        const { uid } = req.params;
        const user = await firebaseAdmin.auth().getUser(uid);

        if (!user.email) {
            return res.status(400).json({ message: 'User does not have an email address' });
        }

        // Generate password reset link
        const link = await firebaseAdmin.auth().generatePasswordResetLink(user.email);

        res.json({
            success: true,
            message: `Password reset link generated for ${user.email}`,
            link // In production, you would send this via email instead of returning it
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
});

// Disable/Enable user account
app.post('/api/firebase-users/:uid/toggle-disabled', async (req, res) => {
    try {
        if (!firebaseAdmin) {
            return res.status(503).json({ message: 'Firebase Admin SDK not available' });
        }

        const { uid } = req.params;
        const { disabled } = req.body;

        await firebaseAdmin.auth().updateUser(uid, { disabled: !!disabled });

        res.json({
            success: true,
            message: disabled ? 'Account disabled' : 'Account enabled',
            disabled: !!disabled
        });
    } catch (error) {
        console.error('Error toggling user disabled status:', error);
        res.status(500).json({ message: 'Failed to update user status' });
    }
});

// Delete user account
app.delete('/api/firebase-users/:uid', async (req, res) => {
    try {
        if (!firebaseAdmin) {
            return res.status(503).json({ message: 'Firebase Admin SDK not available' });
        }

        const { uid } = req.params;

        // Delete from Firebase Auth
        await firebaseAdmin.auth().deleteUser(uid);

        // Also delete from Realtime Database if exists
        try {
            await firebaseAdmin.database().ref(`users/${uid}`).remove();
        } catch (e) {
            // Ignore if not in database
        }

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// Sync all Firebase Auth users to Realtime Database
app.post('/api/firebase-users/sync-all', async (req, res) => {
    try {
        if (!firebaseAdmin) {
            return res.status(503).json({ message: 'Firebase Admin SDK not available' });
        }

        const listUsersResult = await firebaseAdmin.auth().listUsers(1000);
        const db = firebaseAdmin.database();
        let synced = 0;

        for (const user of listUsersResult.users) {
            await db.ref(`users/${user.uid}`).update({
                email: user.email || '',
                name: user.displayName || user.email?.split('@')[0] || 'Unknown',
                photoURL: user.photoURL || null,
                createdAt: new Date(user.metadata.creationTime).getTime(),
                updatedAt: Date.now(),
                provider: user.providerData?.[0]?.providerId || 'email',
                phone: user.phoneNumber || null
            });
            synced++;
        }

        res.json({
            success: true,
            message: `Synced ${synced} users to Realtime Database`,
            count: synced
        });
    } catch (error) {
        console.error('Error syncing users:', error);
        res.status(500).json({ message: 'Failed to sync users' });
    }
});

// ============ Online Users (Presence) API ============
app.get('/api/online-users', async (req, res) => {
    try {
        if (!firebaseAdmin) {
            return res.json([]);
        }

        const db = firebaseAdmin.database();
        const snapshot = await db.ref('presence').once('value');
        const data = snapshot.val();

        if (!data) {
            return res.json([]);
        }

        // Filter only online users
        const onlineUsers = Object.entries(data)
            .filter(([_, userData]) => userData.online === true)
            .map(([uid, userData]) => ({
                uid,
                email: userData.email || '',
                name: userData.name || 'Unknown',
                photoURL: userData.photoURL || null,
                lastSeen: userData.lastSeen
            }));

        res.json(onlineUsers);
    } catch (error) {
        console.error('Error fetching online users:', error);
        res.json([]);
    }
});

// Get total users count
app.get('/api/stats/users-count', async (req, res) => {
    try {
        if (!firebaseAdmin) {
            return res.json({ total: 0, online: 0 });
        }

        // Get total users from Firebase Auth
        const listUsersResult = await firebaseAdmin.auth().listUsers(1000);
        const totalUsers = listUsersResult.users.length;

        // Get online users from presence
        const db = firebaseAdmin.database();
        const snapshot = await db.ref('presence').once('value');
        const presenceData = snapshot.val() || {};

        const onlineCount = Object.values(presenceData).filter((u) => u.online === true).length;

        res.json({ total: totalUsers, online: onlineCount });
    } catch (error) {
        console.error('Error fetching users count:', error);
        res.json({ total: 0, online: 0 });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Admin API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
