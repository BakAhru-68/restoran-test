// src/routes/laporanRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Laporan Harian
router.get("/harian", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(DATE(tanggal), 'YYYY-MM-DD') AS hari,
        SUM(total) AS total_penjualan
      FROM transaksi
      GROUP BY DATE(tanggal)
      ORDER BY hari DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (laporan harian):", err);
    res.status(500).json({ error: "Gagal mengambil laporan harian" });
  }
});

// Laporan Mingguan
router.get("/mingguan", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('week', tanggal), 'YYYY-MM-DD') AS minggu,
        SUM(total) AS total_penjualan
      FROM transaksi
      GROUP BY DATE_TRUNC('week', tanggal)
      ORDER BY minggu DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (laporan mingguan):", err);
    res.status(500).json({ error: "Gagal mengambil laporan mingguan" });
  }
});

// Laporan Bulanan
router.get("/bulanan", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', tanggal), 'YYYY-MM') AS bulan,
        SUM(total) AS total_penjualan
      FROM transaksi
      GROUP BY DATE_TRUNC('month', tanggal)
      ORDER BY bulan DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (laporan bulanan):", err);
    res.status(500).json({ error: "Gagal mengambil laporan bulanan" });
  }
});

module.exports = router;
