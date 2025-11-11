// db/db.js - Database connection setup for Neon
import 'dotenv/config'; 
import pg from 'pg';

// Build connection string
function getConnectionString() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    
    console.log("⚠️ DATABASE_URL not found. Building from individual variables...");
    
    const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
    const PGSSLMODE = process.env.PGSSLMODE || 'require';
    
    if (PGHOST && PGDATABASE && PGUSER && PGPASSWORD) {
        return `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}`;
    }
    
    return null;
}

const connectionString = getConnectionString();

if (!connectionString) {
    console.error("❌ CRITICAL ERROR: Could not get DATABASE_URL!");
    process.exit(1);
}

// Create connection pool
const pool = new pg.Pool({
    connectionString: connectionString,
    max: 5,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.stack);
    } else {
        console.log('✅ Connected to Neon PostgreSQL successfully!');
        release();
    }
});

export default pool;