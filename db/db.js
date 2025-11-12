// db/db.js - Database connection setup for Railway PostgreSQL
import 'dotenv/config'; 
import pg from 'pg';
import { initializeDatabase } from './init.js';

// Build connection string for Railway
function getConnectionString() {
    // Railway provides DATABASE_URL environment variable
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    
    console.log("⚠️ DATABASE_URL not found. Checking for individual Railway variables...");
    
    // Alternative: Check if Railway provides separate variables
    const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
    
    if (PGHOST && PGDATABASE && PGUSER && PGPASSWORD) {
        const port = PGPORT || '5432';
        return `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${port}/${PGDATABASE}?sslmode=require`;
    }
    
    console.error("❌ No database configuration found!");
    console.log("💡 Make sure DATABASE_URL is set in Railway environment variables");
    return null;
}

const connectionString = getConnectionString();

if (!connectionString) {
    console.error("❌ CRITICAL: Could not get database connection string!");
    process.exit(1);
}

// Create connection pool with Railway-optimized settings
const pool = new pg.Pool({
    connectionString: connectionString,
    max: 10, // Railway allows more connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection and initialize database
async function setupDatabase() {
    try {
        const client = await pool.connect();
        console.log('✅ Connected to Railway PostgreSQL successfully!');
        
        // Initialize table if needed
        await initializeDatabase();
        
        client.release();
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.log('💡 Check your Railway environment variables and database configuration');
        process.exit(1);
    }
}

// Run setup when module loads
setupDatabase();

export default pool;