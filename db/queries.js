// db/queries.js - Все команды SQL

import pool from "./db.js"; 

// 1. Читать все книги
export async function getAllBooks() {
    const result = await pool.query("SELECT * FROM books ORDER BY id ASC");
    return result.rows;
}

// 2. Читать одну книгу по ID
export async function findBookById(id) {
    const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
    return result.rows[0];  
}

// 3. Создать новую книгу (INSERT)
export async function addBook(book) {
    const sql = `
        INSERT INTO books (title, author, review, rating, date_read, isbn, cover_url) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
    `;
    const values = [
        book.title, book.author, book.review, book.rating, 
        book.date_read, book.isbn, book.cover_url
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
}

// 4. Обновить существующую книгу (UPDATE)
export async function updateBook(id, book) {
    const sql = `
        UPDATE books 
        SET title = $1, author = $2, review = $3, rating = $4, date_read = $5, isbn = $6, cover_url = $7 
        WHERE id = $8 
        RETURNING *
    `;
    const values = [
        book.title, book.author, book.review, book.rating, 
        book.date_read, book.isbn, book.cover_url, id
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
}

// 5. Удалить книгу (DELETE)
export async function deleteBook(id) {
    await pool.query("DELETE FROM books WHERE id = $1", [id]);
}