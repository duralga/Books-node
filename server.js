import express from "express";
import * as bookService from "./services/bookService.js";
import path from "path"; // 1. Импортируем path
import { fileURLToPath } from 'url'; // 2. Импортируем для получения __dirname

// --- Инициализация для ESM (ES Modules) ---
// 3. Получаем путь к текущему каталогу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Конец инициализации для ESM ---


const app = express();
// Используем переменную PORT из .env, если она есть, иначе 3000
const port = process.env.PORT || 3000; 

// 4. Явно указываем Express, где искать EJS-шаблоны
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Указываем путь к папке views
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Указываем путь к public

// Включаем файл с настройками базы данных, чтобы он запустил Pool и проверил соединение
import "./db/db.js"; 

function getCurrentDate() {
    const d = new Date();
    // Формат YYYY-MM-DD
    return d.toISOString().split('T')[0];
}

// --- Маршруты (GET - показать страницу, POST - обработать форму) ---

// 1. Главная страница (Показать все книги)
app.get("/", async (req, res) => {
    try {
        const books = await bookService.findAllBooks(); 
        res.render("index", { books: books });
    } catch (err) {
        console.error("Ошибка при загрузке главной страницы:", err);
        // Обработка ошибки, если не удалось загрузить данные
        res.render("index", { books: [], error: "Не удалось загрузить книги из Neon." }); 
    }
});

// 2. Показать форму для новой книги
app.get("/new", (req, res) => {
    const currentDate = getCurrentDate();
    res.render("form", {
        heading: "Добавить новую книгу",
        submit: "Добавить книгу",
        book: {}, 
        currentDate: currentDate,
    });
});

// 3. Обработать добавление новой книги
app.post("/add", async (req, res) => {
    try {
        await bookService.createNewBook(req.body); 
        res.redirect("/");
    } catch (err) {
        console.error("Ошибка при добавлении книги:", err);
        res.render("form", {
            heading: "Добавить новую книгу", submit: "Добавить книгу",
            error: "Не удалось добавить книгу.", book: req.body, 
            currentDate: currentDate,
        });
    }
});

// 4. Показать форму для редактирования (с заполненными данными)
app.get("/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const book = await bookService.findBookById(id); 
        if (!book) { return res.redirect("/"); }

        res.render("form", {
            heading: "Редактировать книгу", submit: "Сохранить изменения",
            book: book, 
            currentDate: currentDate,
        });
    } catch (err) {
        console.error("Ошибка при загрузке книги для редактирования:", err);
        res.redirect("/");
    }
});

// 5. Обработать обновление книги
app.post("/update/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await bookService.updateExistingBook(id, req.body); 
        res.redirect("/");
    } catch (err) {
        console.error("Ошибка при обновлении книги:", err);
        res.render("form", {
            heading: "Редактировать книгу", submit: "Сохранить изменения",
            error: "Не удалось обновить книгу.", book: { id: id, ...req.body }, 
            currentDate: currentDate,
        });
    }
});

// 6. Удалить книгу
app.post("/delete/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await bookService.deleteExistingBook(id); 
        res.redirect("/");
    } catch (err) {
        console.error("Ошибка при удалении книги:", err);
        res.redirect("/");
    }
});


// --- Запуск сервера ---
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});