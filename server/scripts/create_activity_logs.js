
import pool from '../src/db.js';

const createActivityLogsTable = async () => {
    try {
        console.log('🔄 Checking/Creating user_activity_logs table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_activity_logs (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255),
                action_type VARCHAR(50) NOT NULL,
                target_element VARCHAR(255),
                page_url VARCHAR(255) NOT NULL,
                meta_data JSONB,
                ip_address VARCHAR(50),
                user_agent TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ user_activity_logs table checked/created successfully');

        // Create index for faster querying of stats
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON user_activity_logs(action_type);
            CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at);
        `);

        console.log('✅ Indices created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error);
        process.exit(1);
    }
};

createActivityLogsTable();
