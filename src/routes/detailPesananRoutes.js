const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE - Tambah detail pesanan + kurangi stok produk
router.post("/", async (req, res) => {
  try {
    const { id_pesanan, id_produk, qty } = req.body;

    if (!id_pesanan || !id_produk || !qty) {
      return res
        .status(400)
        .json({ error: "id_pesanan, id_produk, dan qty wajib diisi" });
    }

    const produkResult = await pool.query(
      "SELECT harga, stok FROM produk WHERE id_produk = $1",
      [id_produk]
    );

    if (produkResult.rows.length === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    const { harga, stok } = produkResult.rows[0];
    if (stok < qty) {
      return res.status(400).json({ error: "Stok tidak mencukupi" });
    }

    const subtotal = harga * qty;

    await pool.query("BEGIN");
    const result = await pool.query(
      `INSERT INTO detail_pesanan (id_pesanan, id_produk, qty, subtotal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_pesanan, id_produk, qty, subtotal]
    );
    await pool.query(
      "UPDATE produk SET stok = stok - $1 WHERE id_produk = $2",
      [qty, id_produk]
    );
    await pool.query("COMMIT");

    res.status(201).json(result.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal menambah detail pesanan" });
  }
});

// READ - Ambil semua detail pesanan
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM detail_pesanan ORDER BY id_detail ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal mengambil detail pesanan" });
  }
});

// READ - Ambil detail berdasarkan id_pesanan
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

// UPDATE - Ubah qty detail pesanan + update stok
router.put("/:id_detail", async (req, res) => {
  try {
    const { id_detail } = req.params;
    const { qty } = req.body;

    if (!qty) {
      return res.status(400).json({ error: "qty wajib diisi" });
    }

    const detail = await pool.query(
      "SELECT id_produk, qty FROM detail_pesanan WHERE id_detail = $1",
      [id_detail]
    );
    if (detail.rows.length === 0) {
      return res.status(404).json({ message: "Detail pesanan tidak ditemukan" });
    }

    const { id_produk, qty: oldQty } = detail.rows[0];
    const produk = await pool.query(
      "SELECT harga, stok FROM produk WHERE id_produk = $1",
      [id_produk]
    );

    const { harga, stok } = produk.rows[0];
    const subtotal = harga * qty;
    const diff = qty - oldQty;

    if (diff > 0 && stok < diff) {
      return res.status(400).json({ error: "Stok tidak mencukupi untuk update" });
    }

    await pool.query("BEGIN");
    const result = await pool.query(
      "UPDATE detail_pesanan SET qty = $1, subtotal = $2 WHERE id_detail = $3 RETURNING *",
      [qty, subtotal, id_detail]
    );
    await pool.query(
      "UPDATE produk SET stok = stok - $1 WHERE id_produk = $2",
      [diff, id_produk]
    );
    await pool.query("COMMIT");

    res.json(result.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal mengubah detail pesanan" });
  }
});

// DELETE - Hapus detail pesanan + kembalikan stok
router.delete("/:id_detail", async (req, res) => {
  try {
    const { id_detail } = req.params;

    const detail = await pool.query(
      "SELECT id_produk, qty FROM detail_pesanan WHERE id_detail = $1",
      [id_detail]
    );
    if (detail.rows.length === 0) {
      return res.status(404).json({ message: "Detail pesanan tidak ditemukan" });
    }

    const { id_produk, qty } = detail.rows[0];

    await pool.query("BEGIN");
    await pool.query("DELETE FROM detail_pesanan WHERE id_detail = $1", [
      id_detail,
    ]);
    await pool.query(
      "UPDATE produk SET stok = stok + $1 WHERE id_produk = $2",
      [qty, id_produk]
    );
    await pool.query("COMMIT");

    res.json({ message: "Detail pesanan berhasil dihapus" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Gagal menghapus detail pesanan" });
  }
});

module.exports = router;
