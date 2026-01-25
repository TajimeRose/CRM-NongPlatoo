import pg from 'pg';
const { Pool } = pg;

// Fallback if destructuring fails (unlikely in default export but possible in some ESM interops)
const DbPool = Pool || pg.default?.Pool || pg.Pool;

const pool = new DbPool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:PdQ0GiGzLIVN0VcY2tKSZtYqm7iiUMCEY7nLZghPF5DcZnZsXNhGtD1HJgjrqnRr@38.242.132.39:8900/postgres',
});

// Test connection
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;
