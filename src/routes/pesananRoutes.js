const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE - Tambah pesanan baru
router.post("/", async (req, res) => {
  try {
    const { id_pelanggan } = req.body;

    // Validasi: id_pelanggan wajib diisi
    if (!id_pelanggan) {
      return res.status(400).json({ error: "id_pelanggan wajib diisi" });
    }

    // Cek apakah pelanggan ada di tabel pelanggan
    const checkPelanggan = await pool.query(
      "SELECT * FROM pelanggan WHERE id_pelanggan = $1",
      [id_pelanggan]
    );

    if (checkPelanggan.rows.length === 0) {
      return res.status(404).json({ error: "Pelanggan tidak ditemukan" });
    }

    // Insert pesanan
    const result = await pool.query(
      `INSERT INTO pesanan (id_pelanggan, status) 
       VALUES ($1, 'pending') 
       RETURNING *`,
      [id_pelanggan]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal menambah pesanan" });
  }
});

// READ - Ambil semua pesanan (include data pelanggan)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id_pesanan, p.tanggal, p.status,
             pl.id_pelanggan, pl.nama, pl.no_hp
      FROM pesanan p
      LEFT JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
      ORDER BY p.id_pesanan ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal mengambil pesanan" });
  }
});

// READ - Ambil pesanan berdasarkan ID (include data pelanggan)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.id_pesanan, p.tanggal, p.status,
              pl.id_pelanggan, pl.nama, pl.no_hp
       FROM pesanan p
       LEFT JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
       WHERE p.id_pesanan = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal mengambil pesanan" });
  }
});

// UPDATE - Ubah status pesanan
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status wajib diisi" });
    }

    const result = await pool.query(
      "UPDATE pesanan SET status = $1 WHERE id_pesanan = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal mengubah pesanan" });
  }
});

// DELETE - Hapus pesanan
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM pesanan WHERE id_pesanan = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }
    res.json({ message: "Pesanan berhasil dihapus" });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal menghapus pesanan" });
  }
});

module.exports = router;
