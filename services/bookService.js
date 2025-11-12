// services/bookService.js - Business logic and rules
import axios from "axios"; 
import * as db from "../db/queries.js"; 

// Find book cover using Open Library API
async function findBookCover(bookTitle, isbn) {
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(bookTitle)}`;
    
    try {
        // Try ISBN search first
        if (isbn) {
            const response = await axios.get(
                `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
            );
            
            const bookData = response.data[`ISBN:${isbn}`];
            if (bookData?.cover) {
                return bookData.cover.large;
            }
        }
        
        // Fallback to title search
        const searchResponse = await axios.get(searchUrl);
        const books = searchResponse.data.docs || [];
        
        for (let book of books) {
            if (book.cover_i) {
                return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
            }
        }
    } catch (error) {
        console.error("Error finding book cover:", error.message);
    }
    
    return null; 
}

// Prepare book data with cover
async function prepareBookData(bookData) {
    let coverUrl = bookData.cover_url;
    
    if (!coverUrl) {
        coverUrl = await findBookCover(bookData.title, bookData.isbn);
    }
    
    return { ...bookData, cover_url: coverUrl };
}

// CRUD operations
export async function findAllBooks() {
    return await db.getAllBooks();
}

export async function findBookById(id) {
    return await db.findBookById(id);
}

export async function deleteExistingBook(id) {
    await db.deleteBook(id);
}

export async function createNewBook(bookData) {
    const preparedData = await prepareBookData(bookData);
    return await db.addBook(preparedData);
}

export async function updateExistingBook(id, bookData) {
    const preparedData = await prepareBookData(bookData);
    return await db.updateBook(id, preparedData);
}