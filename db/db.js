// db/db.js - Настраиваем соединение с PostgreSQL
import 'dotenv/config'; 
import pg from 'pg';

// Функция для сборки Connection String
function getConnectionString() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    
    console.log("⚠️ DATABASE_URL не найдена. Попытка собрать из отдельных переменных...");
    
    const PGHOST = process.env.PGHOST;
    const PGDATABASE = process.env.PGDATABASE;
    const PGUSER = process.env.PGUSER;
    const PGPASSWORD = process.env.PGPASSWORD;
    const PGSSLMODE = process.env.PGSSLMODE || 'require';

    if (PGHOST && PGDATABASE && PGUSER && PGPASSWORD) {
        return `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}`;
    }
    
    return null;
}

// ТОЛЬКО ОДНА переменная connectionString!
const connectionString = getConnectionString();

if (!connectionString) {
    console.error("❌ КРИТИЧЕСКАЯ ОШИБКА: Не удалось получить DATABASE_URL!");
    process.exit(1);
}

// Пул соединений
const pool = new pg.Pool({
    connectionString: connectionString,
    max: 10,
    ssl: {
        rejectUnauthorized: false
    }
});

// Проверка подключения
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Ошибка при подключении к базе данных:', err.stack);
    } else {
        console.log('✅ Успешное подключение к PostgreSQL!');
        release(); 
    }
});

export default pool;