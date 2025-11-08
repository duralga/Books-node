// db/db.js - Настраиваем соединение с Neon

import 'dotenv/config'; 
import pg from 'pg';

// --- Логика сборки Connection String ---
let connectionString = process.env.DATABASE_URL;

// Если DATABASE_URL не задан, собираем его из отдельных частей
if (!connectionString) {
    console.log("⚠️ DATABASE_URL не найдена. Попытка собрать из отдельных переменных...");
    
    // Получаем отдельные части из Render/окружения
    const PGHOST = process.env.PGHOST;
    const PGDATABASE = process.env.PGDATABASE;
    const PGUSER = process.env.PGUSER;
    const PGPASSWORD = process.env.PGPASSWORD;
    const PGSSLMODE = process.env.PGSSLMODE || 'require'; // Устанавливаем require по умолчанию

    if (PGHOST && PGDATABASE && PGUSER && PGPASSWORD) {
        // Собираем полный URL
        connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}`;
    }
}
// -------------------------------------

if (!connectionString) {
    console.error("❌ КРИТИЧЕСКАЯ ОШИБКА: Не удалось получить или собрать DATABASE_URL!");
}


// Уменьшаем размер пула, чтобы избежать лимитов Neon (как советовали ранее)
const pool = new pg.Pool({
    connectionString: connectionString,
    max: 5, 
    ssl: {
        rejectUnauthorized: false
    }
});

// Проверка: убедиться, что подключение работает
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Ошибка при подключении к базе данных Neon:', err.stack);
    }
    console.log('✅ Успешное подключение к Neon PostgreSQL!');
    release(); 
});

export default pool;
