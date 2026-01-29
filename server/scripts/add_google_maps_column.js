import 'dotenv/config';
import pool from '../src/db.js';

async function run() {
    try {
        console.log('🔌 Connecting to database...');
        // A simple query to wake up the connection and ensuring we are connected
        await pool.query('SELECT 1');
        console.log('✅ Connected.');

        console.log('🛠️ Adding google_maps_link column...');
        await pool.query('ALTER TABLE places ADD COLUMN IF NOT EXISTS google_maps_link TEXT;');

        console.log('✅ Successfully added google_maps_link column!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error adding column:', err);
        process.exit(1);
    }
}

run();
