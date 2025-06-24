const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query(\`
  CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    phone TEXT,
    email TEXT,
    key TEXT,
    viber TEXT,
    paydate TEXT
  )
\`);

app.get("/clients", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM clients ORDER BY id DESC");
  res.json(rows);
});

app.post("/clients", async (req, res) => {
  const { phone, email, key, viber, paydate } = req.body;
  await pool.query("INSERT INTO clients (phone, email, key, viber, paydate) VALUES ($1, $2, $3, $4, $5)", [phone, email, key, viber, paydate]);
  res.sendStatus(200);
});

app.put("/clients/:id", async (req, res) => {
  const { phone, email, key, viber, paydate } = req.body;
  const { id } = req.params;
  await pool.query("UPDATE clients SET phone=$1, email=$2, key=$3, viber=$4, paydate=$5 WHERE id=$6", [phone, email, key, viber, paydate, id]);
  res.sendStatus(200);
});

app.delete("/clients/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM clients WHERE id=$1", [id]);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on port " + PORT));
