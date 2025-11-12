// db/db.js - Оптимизированная версия для Railway
import 'dotenv/config'; 
import pg from 'pg';

// Railway автоматически предоставляет DATABASE_URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ DATABASE_URL не найдена!");
    console.log("💡 Railway должен автоматически установить DATABASE_URL");
    process.exit(1);
}

console.log("🔗 Используем DATABASE_URL от Railway");

const pool = new pg.Pool({
    connectionString: connectionString,
    max: 10,
    ssl: { 
        rejectUnauthorized: false 
    }
});

// Улучшенная обработка ошибок
pool.on('connect', () => {
    console.log('✅ Подключение к PostgreSQL установлено');
});

pool.on('error', (err) => {
    console.error('❌ Ошибка базы данных:', err.message);
});

export default pool;