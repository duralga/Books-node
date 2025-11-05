-- sql/schema.sql
-- Этот скрипт создает таблицу для хранения заметок о книгах.

DROP TABLE IF EXISTS books; -- Удаляем таблицу, если она существует (удобно для перезапуска)

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Рейтинг от 1 до 5
    notes TEXT, -- Текст заметок может быть длинным
    date_read DATE, -- Дата прочтения книги
    cover_id VARCHAR(50) -- ID для обложки из Open Library API
);