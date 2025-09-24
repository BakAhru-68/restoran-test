const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * CREATE - Tambah transaksi baru
 * POST /api/transaksi
 */
router.post("/", async (req, res) => {
  try {
    const { id_pesanan, metode_bayar, total } = req.body;

    if (!id_pesanan || !metode_bayar || !total) {
      return res.status(400).json({ error: "id_pesanan, metode_bayar, dan total wajib diisi" });
    }

    // Cek apakah pesanan ada
    const checkPesanan = await pool.query(
      "SELECT * FROM pesanan WHERE id_pesanan = $1",
      [id_pesanan]
    );

    if (checkPesanan.rows.length === 0) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    }

    // Simpan transaksi (tanpa kolom status)
    const result = await pool.query(
      `INSERT INTO transaksi (id_pesanan, metode_bayar, total, tanggal)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [id_pesanan, metode_bayar, total]
    );

    // Update status pesanan jadi lunas
    await pool.query(
      "UPDATE pesanan SET status = 'lunas' WHERE id_pesanan = $1",
      [id_pesanan]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error (POST transaksi):", err);
    res.status(500).json({ error: "Gagal menyimpan transaksi" });
  }
});

/**
 * READ - Ambil semua transaksi
 * GET /api/transaksi
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id_transaksi, t.id_pesanan, t.metode_bayar, t.total, t.tanggal,
             p.status AS status_pesanan
      FROM transaksi t
      JOIN pesanan p ON t.id_pesanan = p.id_pesanan
      ORDER BY t.tanggal DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (GET transaksi):", err);
    res.status(500).json({ error: "Gagal mengambil transaksi" });
  }
});

/**
 * READ - Ambil transaksi berdasarkan ID
 * GET /api/transaksi/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM transaksi WHERE id_transaksi = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error (GET by ID transaksi):", err);
    res.status(500).json({ error: "Gagal mengambil transaksi" });
  }
});

/**
 * UPDATE - Ubah metode bayar transaksi
 * PUT /api/transaksi/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { metode_bayar } = req.body;

    if (!metode_bayar) {
      return res.status(400).json({ error: "Metode bayar wajib diisi" });
    }

    const result = await pool.query(
      "UPDATE transaksi SET metode_bayar = $1 WHERE id_transaksi = $2 RETURNING *",
      [metode_bayar, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error (PUT transaksi):", err);
    res.status(500).json({ error: "Gagal mengubah transaksi" });
  }
});

/**
 * DELETE - Hapus transaksi berdasarkan ID
 * DELETE /api/transaksi/:id
 */
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

module.exports = router;
