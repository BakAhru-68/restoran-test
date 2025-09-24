const { Pool } = require("pg");
require("dotenv").config();

// Buat instance pool koneksi
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "restoran_db",
  max: 20, // jumlah maksimum koneksi
  idleTimeoutMillis: 30000, // 30 detik idle sebelum koneksi ditutup
  connectionTimeoutMillis: 2000, // 2 detik timeout untuk koneksi baru
});

// Tes koneksi
pool
  .connect()
  .then((client) => {
    console.log("✅ Koneksi database berhasil");
    client.release(); // penting! kembalikan koneksi ke pool
  })
  .catch((err) => {
    console.error("❌ Koneksi database gagal:", err.message);
  });

module.exports = pool;
