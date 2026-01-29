import 'dotenv/config';
import pool from '../src/db.js';

async function verify() {
    try {
        console.log('🔍 Checking database columns for "places"...');

        const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'places';
    `);

        console.log('📋 Columns found:');
        const hasGoogleMaps = res.rows.some(r => r.column_name === 'google_maps_link');

        console.table(res.rows.map(r => ({ name: r.column_name, type: r.data_type })));

        if (hasGoogleMaps) {
            console.log('✅ "google_maps_link" column EXISTS.');
        } else {
            console.error('❌ "google_maps_link" column MISSING.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error verifying columns:', err);
        process.exit(1);
    }
}

verify();
