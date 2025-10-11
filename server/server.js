require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bs58 = require("bs58");

const app = express();
const PORT = process.env.PORT || 3000;
const GAME_ACTIVE = process.env.GAME_ACTIVE === "true";
const DEV_WHITELIST = (process.env.DEV_WHITELIST || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("./crownforge.db");

app.use((req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress ||
    "";
  const isAllowed = DEV_WHITELIST.some((allowed) => ip.includes(allowed));

  if (!GAME_ACTIVE && !isAllowed) {
    if (req.url.startsWith("/api")) {
      return res.status(403).json({ error: "Game not started yet" });
    }
  }
  next();
});

app.post("/api/login", (req, res) => {
  const { wallet, message, signature } = req.body;
  if (!wallet || !message || !signature) {
    return res.status(400).json({ error: "Invalid login request" });
  }
  const token = jwt.sign({ wallet }, "crownforge_secret", { expiresIn: "7d" });
  res.json({ token });
});

app.get("/api/state", (req, res) => {
  db.all("SELECT * FROM players", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Crownforge backend running on port ${PORT}`);
});
