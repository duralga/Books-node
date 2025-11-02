
import express from "express";
import * as bookService from "./services/bookService.js"; // Наш Менеджер

// --- Инициализация ---
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Включаем файл с настройками базы данных, чтобы он запустил Pool и проверил соединение
import "./db/db.js"; 

// --- Маршруты (GET - показать страницу, POST - обработать форму) ---

// 1. Главная страница (Показать все книги)
app.get("/", async (req, res) => {
    try {
        const books = await bookService.findAllBooks(); // Вызываем Менеджера
        res.render("index", { books: books });
    } catch (err) {
        console.error("Ошибка при загрузке главной страницы:", err);
        res.render("index", { books: [], error: "Не удалось загрузить книги." });
    }
});

// 2. Показать форму для новой книги
app.get("/new", (req, res) => {
    res.render("form", {
        heading: "Добавить новую книгу",
        submit: "Добавить книгу",
        book: {}, 
    });
});

// 3. Обработать добавление новой книги
app.post("/add", async (req, res) => {
    try {
        await bookService.createNewBook(req.body); // Вызываем Менеджера
        res.redirect("/");
    } catch (err) {
        console.error("Ошибка при добавлении книги:", err);
        res.render("form", {
            heading: "Добавить новую книгу", submit: "Добавить книгу",
            error: "Не удалось добавить книгу.", book: req.body, 
        });
    }
});

// 4. Показать форму для редактирования (с заполненными данными)
app.get("/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const book = await bookService.findBookById(id); // Вызываем Менеджера
        if (!book) { return res.redirect("/"); }

        res.render("form", {
            heading: "Редактировать книгу", submit: "Сохранить изменения",
            book: book, 
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
        await bookService.updateExistingBook(id, req.body); // Вызываем Менеджера
        res.redirect("/");
    } catch (err) {
        console.error("Ошибка при обновлении книги:", err);
        res.render("form", {
            heading: "Редактировать книгу", submit: "Сохранить изменения",
            error: "Не удалось обновить книгу.", book: { id: id, ...req.body }, 
        });
    }
});

// 6. Удалить книгу
app.post("/delete/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await bookService.deleteExistingBook(id); // Вызываем Менеджера
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