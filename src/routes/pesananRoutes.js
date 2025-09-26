const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE – Buat pesanan + detail
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_pelanggan, catatan, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items wajib diisi" });
    }

    await client.query("BEGIN");

    // 1. Insert pesanan
    const pesananResult = await client.query(
      `INSERT INTO pesanan (id_pelanggan, tanggal, status, catatan)
       VALUES ($1, NOW(), 'pending', $2)
       RETURNING *`,
      [id_pelanggan || null, catatan || null]
    );
    const pesanan = pesananResult.rows[0];

    // 2. Insert detail pesanan
    for (const item of items) {
      const produk = await client.query(
        "SELECT harga, stok FROM produk WHERE id_produk = $1",
        [item.id_produk]
      );

      if (produk.rows.length === 0) {
        throw new Error(`Produk ID ${item.id_produk} tidak ditemukan`);
      }

      const { harga, stok } = produk.rows[0];
      if (stok < item.qty) {
        throw new Error(`Stok produk ID ${item.id_produk} tidak mencukupi`);
      }

      const subtotal = harga * item.qty;

      // Simpan ke detail_pesanan
      await client.query(
        `INSERT INTO detail_pesanan (id_pesanan, id_produk, qty, subtotal)
         VALUES ($1, $2, $3, $4)`,
        [pesanan.id_pesanan, item.id_produk, item.qty, subtotal]
      );

      // Update stok produk
      await client.query(
        "UPDATE produk SET stok = stok - $1 WHERE id_produk = $2",
        [item.qty, item.id_produk]
      );
    }

    // 3. Ambil ulang detail pesanan lengkap
    const detailResult = await client.query(
      `SELECT dp.id_produk, p.nama_produk, p.harga, dp.qty, dp.subtotal
       FROM detail_pesanan dp
       JOIN produk p ON dp.id_produk = p.id_produk
       WHERE dp.id_pesanan = $1`,
      [pesanan.id_pesanan]
    );

    const total = detailResult.rows.reduce(
      (acc, cur) => acc + Number(cur.subtotal),
      0
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Pesanan berhasil dibuat",
      pesanan: {
        ...pesanan,
        items: detailResult.rows,
        total: total,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ DB Error (POST pesanan):", err.message);
    res.status(500).json({ error: err.message || "Gagal membuat pesanan" });
  } finally {
    client.release();
  }
});

// READ – Semua pesanan
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id_pesanan, p.tanggal, p.status, p.catatan,
              pl.id_pelanggan, pl.nama, pl.no_hp
       FROM pesanan p
       LEFT JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
       ORDER BY p.id_pesanan ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (GET pesanan):", err);
    res.status(500).json({ error: "Gagal mengambil pesanan" });
  }
});

// READ – Pesanan by ID + detail
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pesananResult = await pool.query(
      `SELECT p.id_pesanan, p.tanggal, p.status, p.catatan,
              pl.id_pelanggan, pl.nama, pl.no_hp
       FROM pesanan p
       LEFT JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
       WHERE p.id_pesanan = $1`,
      [id]
    );

    if (pesananResult.rows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    const pesanan = pesananResult.rows[0];

    // Ambil detail
    const detailResult = await pool.query(
      `SELECT dp.id_produk, p.nama_produk, p.harga, dp.qty, dp.subtotal
       FROM detail_pesanan dp
       JOIN produk p ON dp.id_produk = p.id_produk
       WHERE dp.id_pesanan = $1`,
      [id]
    );

    const total = detailResult.rows.reduce(
      (acc, cur) => acc + Number(cur.subtotal),
      0
    );

    res.json({ ...pesanan, items: detailResult.rows, total });
  } catch (err) {
    console.error("❌ DB Error (GET pesanan by ID):", err);
    res.status(500).json({ error: "Gagal mengambil pesanan" });
  }
});

// UPDATE – Ubah status atau catatan
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    const result = await pool.query(
      `UPDATE pesanan
       SET status = COALESCE($1, status),
           catatan = COALESCE($2, catatan)
       WHERE id_pesanan = $3
       RETURNING *`,
      [status || null, catatan || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error (PUT pesanan):", err);
    res.status(500).json({ error: "Gagal mengubah pesanan" });
  }
});

// DELETE – Hapus pesanan
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("BEGIN");
    await pool.query("DELETE FROM detail_pesanan WHERE id_pesanan = $1", [id]);
    const result = await pool.query(
      "DELETE FROM pesanan WHERE id_pesanan = $1 RETURNING *",
      [id]
    );
    await pool.query("COMMIT");

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    res.json({ message: "Pesanan berhasil dihapus" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("❌ DB Error (DELETE pesanan):", err);
    res.status(500).json({ error: "Gagal menghapus pesanan" });
  }
});

module.exports = router;
