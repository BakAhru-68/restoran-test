const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE - Tambah detail pesanan
router.post("/", async (req, res) => {
  try {
    const { id_pesanan, id_produk, qty } = req.body;

    if (!id_pesanan || !id_produk || !qty) {
      return res.status(400).json({ error: "id_pesanan, id_produk, dan qty wajib diisi" });
    }

    // Ambil harga produk
    const produkResult = await pool.query(
      "SELECT harga FROM produk WHERE id_produk = $1",
      [id_produk]
    );

    if (produkResult.rows.length === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    const harga = produkResult.rows[0].harga;
    const subtotal = harga * qty;

    // Insert ke detail_pesanan
    const result = await pool.query(
      `INSERT INTO detail_pesanan (id_pesanan, id_produk, qty, subtotal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_pesanan, id_produk, qty, subtotal]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal menambah detail pesanan" });
  }
});

// READ - Ambil semua detail pesanan berdasarkan id_pesanan
router.get("/:id_pesanan", async (req, res) => {
  try {
    const { id_pesanan } = req.params;

    const result = await pool.query(
      `SELECT d.id_detail, d.qty, d.subtotal,
              p.id_produk, p.nama_produk, p.harga
       FROM detail_pesanan d
       JOIN produk p ON d.id_produk = p.id_produk
       WHERE d.id_pesanan = $1`,
      [id_pesanan]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal mengambil detail pesanan" });
  }
});

// DELETE - Hapus item detail pesanan
router.delete("/:id_detail", async (req, res) => {
  try {
    const { id_detail } = req.params;

    const result = await pool.query(
      "DELETE FROM detail_pesanan WHERE id_detail = $1 RETURNING *",
      [id_detail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Detail pesanan tidak ditemukan" });
    }

    res.json({ message: "Detail pesanan berhasil dihapus" });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal menghapus detail pesanan" });
  }
});

module.exports = router;
