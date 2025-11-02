// db/db.js - Настраиваем соединение

import 'dotenv/config'; // Загружаем переменные из .env
import pg from 'pg';

// Используем Пул для надежного и быстрого соединения с базой
const pool = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD, 
    port: process.env.PG_PORT,
});

// Проверка: убедиться, что подключение работает
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Ошибка при подключении к базе данных', err.stack);
    }
    console.log('✅ Успешное подключение к PostgreSQL!');
    release();
});

export default pool; // Отдаем Пул для использования в других файлах