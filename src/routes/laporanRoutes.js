const express = require("express");
const router = express.Router();
const pool = require("../config/db");

//
// ======================== LAPORAN HARIAN ========================
//
router.get("/harian", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(t.tanggal) AS tanggal,
        SUM(t.total) AS total_harian,
        COUNT(t.id_transaksi) AS jumlah_transaksi
      FROM transaksi t
      GROUP BY DATE(t.tanggal)
      ORDER BY tanggal DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (laporan harian):", err);
    res.status(500).json({ error: "Gagal mengambil laporan harian" });
  }
});

//
// ======================== LAPORAN MINGGUAN ========================
//
router.get("/mingguan", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('week', t.tanggal)::DATE AS minggu,
        SUM(t.total) AS total_mingguan,
        COUNT(t.id_transaksi) AS jumlah_transaksi
      FROM transaksi t
      GROUP BY minggu
      ORDER BY minggu DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (laporan mingguan):", err);
    res.status(500).json({ error: "Gagal mengambil laporan mingguan" });
  }
});

//
// ======================== LAPORAN BULANAN ========================
//
router.get("/bulanan", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(t.tanggal, 'YYYY-MM') AS bulan,
        SUM(t.total) AS total_bulanan,
        COUNT(t.id_transaksi) AS jumlah_transaksi
      FROM transaksi t
      GROUP BY bulan
      ORDER BY bulan DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (laporan bulanan):", err);
    res.status(500).json({ error: "Gagal mengambil laporan bulanan" });
  }
});

//
// ======================== LAPORAN PER PRODUK ========================
//
router.get("/produk", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pr.nama_produk,
        k.nama_kategori,
        SUM(dp.qty) AS total_terjual,
        SUM(dp.subtotal) AS pendapatan
      FROM detail_pesanan dp
      JOIN produk pr ON dp.id_produk = pr.id_produk
      JOIN kategori k ON pr.id_kategori = k.id_kategori
      GROUP BY pr.nama_produk, k.nama_kategori
      ORDER BY pendapatan DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (laporan produk):", err);
    res.status(500).json({ error: "Gagal mengambil laporan produk" });
  }
});

module.exports = router;
