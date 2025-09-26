// src/routes/transaksiRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

//
// ======================== GET ALL (AGGREGATED) ========================
//
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id_transaksi,
        t.id_pesanan,
        t.metode_bayar,
        t.total,
        t.tanggal,
        json_agg(
          json_build_object(
            'nama_produk', pr.nama_produk,
            'qty', dp.qty,
            'harga', pr.harga,
            'subtotal', dp.subtotal
          )
        ) AS items
      FROM transaksi t
      LEFT JOIN detail_pesanan dp ON t.id_pesanan = dp.id_pesanan
      LEFT JOIN produk pr ON dp.id_produk = pr.id_produk
      GROUP BY t.id_transaksi, t.id_pesanan, t.metode_bayar, t.total, t.tanggal
      ORDER BY t.id_transaksi ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (GET transaksi):", err);
    res.status(500).json({ error: "Gagal mengambil data transaksi" });
  }
});

//
// ======================== CREATE ========================
//
router.post("/", async (req, res) => {
  try {
    const { id_pesanan, metode_bayar } = req.body;

    // Hitung total dari detail_pesanan
    const totalQuery = await pool.query(
      "SELECT COALESCE(SUM(subtotal),0) AS total FROM detail_pesanan WHERE id_pesanan = $1",
      [id_pesanan]
    );
    const total = totalQuery.rows[0].total || 0; // jika tidak ada detail, total = 0

    // Transaksi tetap dibuat walaupun detail kosong
    const result = await pool.query(
      `INSERT INTO transaksi (id_pesanan, metode_bayar, total, tanggal)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [id_pesanan, metode_bayar, total]
    );

    res.status(201).json({
      message: "Transaksi berhasil dibuat",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ DB Error (POST transaksi):", err);
    res.status(500).json({ error: "Gagal menambah transaksi" });
  }
});

//
// ======================== GET DETAIL (JOIN) ========================
//
router.get("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
         t.id_transaksi,
         t.metode_bayar,
         t.total,
         t.tanggal,
         p.id_pesanan,
         pr.nama_produk,
         pr.harga,
         dp.qty,
         dp.subtotal,
         k.nama_kategori
       FROM transaksi t
       JOIN pesanan p ON t.id_pesanan = p.id_pesanan
       LEFT JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
       LEFT JOIN produk pr ON dp.id_produk = pr.id_produk
       LEFT JOIN kategori k ON pr.id_kategori = k.id_kategori
       WHERE t.id_transaksi = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Detail transaksi tidak ditemukan" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (GET detail transaksi):", err);
    res.status(500).json({ error: "Gagal mengambil detail transaksi" });
  }
});

//
// ======================== GET BY ID ========================
//
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        t.id_transaksi,
        t.id_pesanan,
        t.metode_bayar,
        t.total,
        t.tanggal
      FROM transaksi t
      WHERE t.id_transaksi = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error (GET transaksi by id):", err);
    res.status(500).json({ error: "Gagal mengambil transaksi" });
  }
});

//
// ======================== DELETE ========================
//
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM transaksi WHERE id_transaksi = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.json({ message: "Transaksi berhasil dihapus" });
  } catch (err) {
    console.error("❌ DB Error (DELETE transaksi):", err);
    res.status(500).json({ error: "Gagal menghapus transaksi" });
  }
});

//
// ======================== UPDATE ========================
//
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_pesanan, metode_bayar } = req.body;

    // Hitung ulang total
    const totalQuery = await pool.query(
      "SELECT COALESCE(SUM(subtotal),0) AS total FROM detail_pesanan WHERE id_pesanan = $1",
      [id_pesanan]
    );
    const total = totalQuery.rows[0].total || 0;

    const result = await pool.query(
      `UPDATE transaksi
       SET id_pesanan = $1,
           metode_bayar = $2,
           total = $3,
           tanggal = NOW()
       WHERE id_transaksi = $4
       RETURNING *`,
      [id_pesanan, metode_bayar, total, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.json({
      message: "Transaksi berhasil diupdate",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ DB Error (PUT transaksi):", err);
    res.status(500).json({ error: "Gagal update transaksi" });
  }
});

module.exports = router;
