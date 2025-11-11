// server.js - Main application server
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import * as bookService from "./services/bookService.js";
import "./db/db.js"; 

// ESM directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// App configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Helper functions
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

function handleServerError(res, view, context, error) {
    console.error(`Server error in ${view}:`, error);
    res.render(view, { 
        ...context, 
        error: "Something went wrong. Please try again." 
    });
}

// Routes

// Home page - show all books
app.get("/", async (req, res) => {
    try {
        const books = await bookService.findAllBooks();
        res.render("index", { books });
    } catch (error) {
        handleServerError(res, "index", { books: [] }, error);
    }
});

// Show form for new book
app.get("/new", (req, res) => {
    res.render("form", {
        heading: "Add New Book",
        submit: "Add Book",
        book: {},
        currentDate: getCurrentDate(),
    });
});

// Handle new book submission
app.post("/add", async (req, res) => {
    try {
        await bookService.createNewBook(req.body);
        res.redirect("/");
    } catch (error) {
        handleServerError(res, "form", {
            heading: "Add New Book",
            submit: "Add Book",
            book: req.body,
            currentDate: getCurrentDate(),
        }, error);
    }
});

// Show edit form
app.get("/edit/:id", async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const book = await bookService.findBookById(bookId);
        
        if (!book) {
            return res.redirect("/");
        }

        res.render("form", {
            heading: "Edit Book",
            submit: "Save Changes",
            book: book,
            currentDate: getCurrentDate(),
        });
    } catch (error) {
        res.redirect("/");
    }
});

// Handle book update
app.post("/update/:id", async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        await bookService.updateExistingBook(bookId, req.body);
        res.redirect("/");
    } catch (error) {
        handleServerError(res, "form", {
            heading: "Edit Book",
            submit: "Save Changes",
            book: { id: parseInt(req.params.id), ...req.body },
            currentDate: getCurrentDate(),
        }, error);
    }
});

// Handle book deletion
app.post("/delete/:id", async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        await bookService.deleteExistingBook(bookId);
        res.redirect("/");
    } catch (error) {
        console.error("Delete error:", error);
        res.redirect("/");
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});