const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

// CREATE - tambah produk baru
router.post("/", async (req, res) => {
  try {
    const { nama_produk, harga, stok, id_kategori } = req.body;

    const result = await pool.query(
      "INSERT INTO produk (nama_produk, harga, stok, id_kategori) VALUES ($1, $2, $3, $4) RETURNING *",
      [nama_produk, harga, stok, id_kategori]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah produk" });
  }
});

// READ - ambil semua produk
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id_produk, p.nama_produk, p.harga, p.stok, k.nama_kategori
       FROM produk p
       JOIN kategori k ON p.id_kategori = k.id_kategori
       ORDER BY p.id_produk ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
});

// READ - ambil produk berdasarkan kategori
router.get("/kategori/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.id_produk, p.nama_produk, p.harga, p.stok, k.nama_kategori
       FROM produk p
       JOIN kategori k ON p.id_kategori = k.id_kategori
       WHERE p.id_kategori = $1
       ORDER BY p.id_produk ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Gagal mengambil produk berdasarkan kategori" });
  }
});

// UPDATE - ubah produk
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_produk, harga, stok, id_kategori } = req.body;

    const result = await pool.query(
      `UPDATE produk 
       SET nama_produk=$1, harga=$2, stok=$3, id_kategori=$4
       WHERE id_produk=$5 RETURNING *`,
      [nama_produk, harga, stok, id_kategori, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengubah produk" });
  }
});

// DELETE - hapus produk
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM produk WHERE id_produk=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus produk" });
  }
});

module.exports = router;
