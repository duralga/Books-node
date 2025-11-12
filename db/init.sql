// db/init.js - Database table initialization
import pool from './db.js';

export async function initializeDatabase() {
    try {
        console.log('🔄 Checking if books table exists...');
        
        // Check if table exists
        const checkTableQuery = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'books'
            );
        `;
        
        const result = await pool.query(checkTableQuery);
        const tableExists = result.rows[0].exists;
        
        if (!tableExists) {
            console.log('📚 Creating books table...');
            
            const createTableQuery = `
                CREATE TABLE books (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    author VARCHAR(255) NOT NULL,
                    review TEXT,
                    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                    date_read DATE NOT NULL,
                    isbn VARCHAR(20),
                    cover_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                -- Create index for better performance
                CREATE INDEX idx_books_date_read ON books(date_read DESC);
                CREATE INDEX idx_books_author ON books(author);
            `;
            
            await pool.query(createTableQuery);
            console.log('✅ Books table created successfully!');
            
            // Add sample data (optional)
            await addSampleData();
        } else {
            console.log('✅ Books table already exists.');
        }
        
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    }
}

async function addSampleData() {
    try {
        console.log('📖 Adding sample book data...');
        
        const sampleBooks = [
            {
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                review: "A classic American novel about the Jazz Age and the American Dream.",
                rating: 5,
                date_read: "2023-10-15",
                isbn: "9780743273565",
                cover_url: "https://covers.openlibrary.org/b/id/9265910-L.jpg"
            },
            {
                title: "To Kill a Mockingbird",
                author: "Harper Lee", 
                review: "Powerful story about racial injustice and moral growth.",
                rating: 5,
                date_read: "2023-09-22",
                isbn: "9780061120084",
                cover_url: "https://covers.openlibrary.org/b/id/8264792-L.jpg"
            }
        ];
        
        for (const book of sampleBooks) {
            await pool.query(
                `INSERT INTO books (title, author, review, rating, date_read, isbn, cover_url) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [book.title, book.author, book.review, book.rating, book.date_read, book.isbn, book.cover_url]
            );
        }
        
        console.log('✅ Sample data added successfully!');
    } catch (error) {
        console.error('⚠️ Could not add sample data:', error.message);
    }
}

// Function to reset database (for development)
export async function resetDatabase() {
    try {
        console.log('🔄 Resetting database...');
        await pool.query('DROP TABLE IF EXISTS books CASCADE;');
        console.log('✅ Database reset successfully!');
        await initializeDatabase();
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        throw error;
    }
}