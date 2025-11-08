// services/bookService.js - Правила и логика

import axios from "axios"; 
import * as db from "../db/queries.js"; 


// --- Логика поиска обложки ---
async function getCoverUrl(bookTitle, isbn) {
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(bookTitle)}`;
    const coverBaseUrl = "https://covers.openlibrary.org/b/";
    
    try {
        if (isbn) { // Попытка 1: Поиск по ISBN
            const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
            if (response.data[`ISBN:${isbn}`] && response.data[`ISBN:${isbn}`].cover) {
                return response.data[`ISBN:${isbn}`].cover.large;
            }
        }
        
        // Попытка 2: Поиск по названию
        const searchResponse = await axios.get(searchUrl);
        const docs = searchResponse.data.docs;
        if (docs && docs.length > 0) {
            for (let doc of docs) {
                if (doc.cover_i) {
                    return `${coverBaseUrl}id/${doc.cover_i}-L.jpg`;
                }
            }
        }
    } catch (error) {
        console.error("Ошибка при получении обложки:", error.message);
    }
    return null; 
}


// --- Функции CRUD ---

export async function findAllBooks() {
    return await db.getAllBooks();
}

export async function findBookById(id) {
    return await db.findBookById(id);
}

export async function deleteExistingBook(id) {
    await db.deleteBook(id);
}


// Самая важная функция: Добавление с логикой
export async function createNewBook(bookData) {
    // ПРАВИЛО: Сначала найди обложку, если ее нет
    let coverUrl = bookData.cover_url;
    if (!coverUrl) {
        coverUrl = await getCoverUrl(bookData.title, bookData.isbn);
    }

    const bookToSave = { ...bookData, cover_url: coverUrl };
    
    // ПРАВИЛО: Потом сохрани в базу
    return await db.addBook(bookToSave);
}

// Вторая важная функция: Обновление с логикой
export async function updateExistingBook(id, bookData) {
    // ПРАВИЛО: Сначала найди обложку, если ее нет
    let coverUrl = bookData.cover_url;
    if (!coverUrl) {
        coverUrl = await getCoverUrl(bookData.title, bookData.isbn);
    }

    const bookToUpdate = { ...bookData, cover_url: coverUrl };

    // ПРАВИЛО: Потом обнови в базе
    return await db.updateBook(id, bookToUpdate);
}