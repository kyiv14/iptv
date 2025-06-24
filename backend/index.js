const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Подключение к базе через переменную окружения DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // для Render/Supabase
});

// Создаём таблицу clients при старте
pool.query(`
  CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    phone TEXT,
    email TEXT,
    key TEXT,
    viber TEXT,
    paydate TEXT
  );
`).catch((err) => console.error("Ошибка при создании таблицы:", err));

// Получить всех клиентов
app.get("/clients", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM clients ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения клиентов" });
  }
});

// Добавить клиента
app.post("/clients", async (req, res) => {
  const { phone, email, key, viber, paydate } = req.body;
  try {
    await pool.query(
      "INSERT INTO clients (phone, email, key, viber, paydate) VALUES ($1, $2, $3, $4, $5)",
      [phone, email, key, viber, paydate]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка добавления клиента" });
  }
});

// Обновить клиента
app.put("/clients/:id", async (req, res) => {
  const { id } = req.params;
  const { phone, email, key, viber, paydate } = req.body;
  try {
    await pool.query(
      "UPDATE clients SET phone=$1, email=$2, key=$3, viber=$4, paydate=$5 WHERE id=$6",
      [phone, email, key, viber, paydate, id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка обновления клиента" });
  }
});

// Удалить клиента
app.delete("/clients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM clients WHERE id=$1", [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка удаления клиента" });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("✅ Backend работает на порту", PORT));
