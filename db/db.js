// db/db.js - Настраиваем соединение с Neon

import 'dotenv/config'; 
import pg from 'pg';

// Используем DATABASE_URL из .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ КРИТИЧЕСКАЯ ОШИБКА: Переменная DATABASE_URL не найдена в .env!");
    // В рабочей среде лучше не останавливаться, а просто не принимать запросы к БД
    // Но для Codespaces можно остановить, чтобы обратить внимание на ошибку
    // process.exit(1); 
}

// 💡 Используем объект, который принимает строку connectionString
const pool = new pg.Pool({
    connectionString: connectionString,
    // ВАЖНО: Node-Postgres автоматически обрабатывает SSL из URI, 
    // но явно указать его - хорошая практика для Neon.
    ssl: {
        rejectUnauthorized: false // Neon требует SSL
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