const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - tambah pelanggan baru
router.post('/', async (req, res) => {
  try {
    const { nama, no_hp } = req.body;
    const result = await pool.query(
      'INSERT INTO pelanggan (nama, no_hp) VALUES ($1, $2) RETURNING *',
      [nama, no_hp]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error (POST):", err);
    res.status(500).json({ error: 'Gagal menambah pelanggan' });
  }
});

// READ - ambil semua pelanggan
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pelanggan ORDER BY id_pelanggan ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (GET ALL):", err);
    res.status(500).json({ error: 'Gagal mengambil data pelanggan' });
  }
});

// READ - ambil pelanggan by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM pelanggan WHERE id_pelanggan = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error (GET BY ID):", err);
    res.status(500).json({ error: 'Gagal mengambil data pelanggan' });
  }
});

// UPDATE - ubah pelanggan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, no_hp } = req.body;
    const result = await pool.query(
      'UPDATE pelanggan SET nama = $1, no_hp = $2 WHERE id_pelanggan = $3 RETURNING *',
      [nama, no_hp, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error (PUT):", err);
    res.status(500).json({ error: 'Gagal mengubah data pelanggan' });
  }
});

// DELETE - hapus pelanggan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM pelanggan WHERE id_pelanggan = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }
    res.json({ message: 'Pelanggan berhasil dihapus' });
  } catch (err) {
    console.error("❌ DB Error (DELETE):", err);
    res.status(500).json({ error: 'Gagal menghapus pelanggan' });
  }
});

module.exports = router;
