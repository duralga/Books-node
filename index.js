// index.js

import express from "express";
import pg from "pg";
import axios from "axios"; // Добавили axios, понадобится для API обложек

const app = express();
const port = 3000;

// Настройка подключения к базе данных PostgreSQL
// ЗАМЕНИТЕ ЭТИ ЗНАЧЕНИЯ НА СВОИ!
const db = new pg.Client({
  user: "postgres", // Ваше имя пользователя PostgreSQL
  host: "localhost",
  database: "book_notes_db", // Имя базы данных, которую мы "создали"
  password: "YOUR_POSTGRES_PASSWORD", // Ваш пароль от PostgreSQL
  port: 5432,
});

// Подключение к базе данных
db.connect();

// Настройка Express для использования EJS в качестве шаблонизатора
app.set("view engine", "ejs");

// Настройка Express для обработки данных из форм (urlencoded)
app.use(express.urlencoded({ extended: true }));

// Разрешаем Express обслуживать статические файлы (например, CSS, JS) из папки 'public'
app.use(express.static("public"));

// Маршрут для главной страницы - отображение всех книг
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY id ASC"); // Можно добавить сортировку по умолчанию
    const books = result.rows;
    
    res.render("index", {
      books: books,
    });

  } catch (err) {
    console.error("Ошибка при запросе данных:", err);
    res.render("index", {
      books: [],
      error: "Не удалось загрузить книги."
    });
  }
});

// Маршрут для отображения формы добавления новой книги
app.get("/new", (req, res) => {
  res.render("form", {
    heading: "Добавить новую книгу",
    submit: "Добавить книгу",
    book: {}, // Пустой объект для новой книги
  });
});

// Маршрут для обработки отправленной формы (добавление новой книги)
// ... (до `app.post("/add")`) ...

app.post("/add", async (req, res) => {
  const { title, author, review, rating, date_read, isbn } = req.body; // Добавили isbn
  let cover_url = req.body.cover_url; // Можем использовать явно указанный URL или получить его

  try {
    // Если URL обложки не был указан вручную, пытаемся найти его через API
    if (!cover_url) {
      cover_url = await getCoverUrl(title, isbn);
    }

    const result = await db.query(
      "INSERT INTO books (title, author, review, rating, date_read, isbn, cover_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", // Добавили isbn
      [title, author, review, rating, date_read, isbn, cover_url] // Добавили isbn
    );
    res.redirect("/");
  } catch (err) {
    console.error("Ошибка при добавлении книги:", err);
    res.render("form", {
      heading: "Добавить новую книгу",
      submit: "Добавить книгу",
      error: "Не удалось добавить книгу. Пожалуйста, проверьте данные.",
      book: { ...req.body, isbn: isbn || '' }, // Возвращаем введенные данные, включая isbn
    });
  }
});
// Маршрут для обработки отправленной формы (обновление книги)
// ... (до `app.post("/update/:id")`) ...

app.post("/update/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author, review, rating, date_read, isbn } = req.body; // Добавили isbn
  let cover_url = req.body.cover_url; // Можем использовать явно указанный URL или получить его

  try {
    // Если URL обложки не был указан вручную ИЛИ он пустой в форме, пытаемся найти его через API
    if (!cover_url) {
      cover_url = await getCoverUrl(title, isbn);
    }

    await db.query(
      "UPDATE books SET title = $1, author = $2, review = $3, rating = $4, date_read = $5, isbn = $6, cover_url = $7 WHERE id = $8", // Добавили isbn
      [title, author, review, rating, date_read, isbn, cover_url, id] // Добавили isbn
    );
    res.redirect("/");
  } catch (err) {
    console.error("Ошибка при обновлении книги:", err);
    const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    const book = result.rows[0];
    res.render("form", {
      heading: "Редактировать книгу",
      submit: "Сохранить изменения",
      error: "Не удалось обновить книгу. Пожалуйста, проверьте данные.",
      book: { ...book, ...req.body, isbn: isbn || '' }, // Обновляем данные книги, включая isbn
    });
  }
});
// Маршрут для удаления книги
app.post("/delete/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error("Ошибка при удалении книги:", err);
    res.redirect("/");
  }
});

async function getCoverUrl(bookTitle, isbn) {
    // Базовый URL для поиска в Open Library
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(bookTitle)}`;
    const coverBaseUrl = "https://covers.openlibrary.org/b/";

    try {
        let coverId = null;
        let coverType = null;

        if (isbn) {
            // Если есть ISBN, пытаемся получить обложку по ISBN
            const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
            const data = response.data;
            if (data[`ISBN:${isbn}`] && data[`ISBN:${isbn}`].cover && data[`ISBN:${isbn}`].cover.large) {
                return data[`ISBN:${isbn}`].cover.large; // Если нашли по ISBN
            }
        }

        // Если нет ISBN или по ISBN не нашли, ищем по названию
        const searchResponse = await axios.get(searchUrl);
        const docs = searchResponse.data.docs;

        if (docs && docs.length > 0) {
            // Ищем первую книгу с обложкой
            for (let doc of docs) {
                if (doc.cover_i) { // cover_i - это ID обложки
                    coverId = doc.cover_i;
                    coverType = "id";
                    break;
                } else if (doc.isbn && doc.isbn.length > 0) {
                    coverId = doc.isbn[0];
                    coverType = "isbn";
                    break;
                }
            }
        }

        if (coverId && coverType) {
            return `${coverBaseUrl}${coverType}/${coverId}-L.jpg`; // Возвращаем большой размер
        }
    } catch (error) {
        console.error("Ошибка при получении обложки:", error.message);
    }
    return null; // Если обложка не найдена
}



// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});