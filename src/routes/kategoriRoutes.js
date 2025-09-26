// src/routes/kategoriRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * CREATE - Tambah kategori baru
 * POST /api/kategori
 */
router.post('/', async (req, res) => {
  try {
    const { nama_kategori } = req.body;

    if (!nama_kategori) {
      return res.status(400).json({ error: 'nama_kategori wajib diisi' });
    }

    // ✅ Cek apakah nama kategori sudah ada (case-insensitive)
    const check = await pool.query(
      'SELECT * FROM kategori WHERE LOWER(nama_kategori) = LOWER($1)',
      [nama_kategori]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Kategori sudah ada!' });
    }

    const result = await pool.query(
      'INSERT INTO kategori (nama_kategori) VALUES ($1) RETURNING *',
      [nama_kategori]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error create kategori:', err.message);
    res.status(500).json({ error: 'Gagal menambah kategori' });
  }
});

/**
 * READ - Ambil semua kategori
 * GET /api/kategori
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM kategori ORDER BY id_kategori ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error get kategori:', err.message);
    res.status(500).json({ error: 'Gagal mengambil kategori' });
  }
});

/**
 * UPDATE - Ubah kategori berdasarkan ID
 * PUT /api/kategori/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kategori } = req.body;

    if (!nama_kategori) {
      return res.status(400).json({ error: 'nama_kategori wajib diisi' });
    }

    // ✅ Cek apakah nama kategori sudah dipakai oleh kategori lain
    const check = await pool.query(
      'SELECT * FROM kategori WHERE LOWER(nama_kategori) = LOWER($1) AND id_kategori != $2',
      [nama_kategori, id]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Kategori dengan nama ini sudah ada!' });
    }

    const result = await pool.query(
      'UPDATE kategori SET nama_kategori=$1 WHERE id_kategori=$2 RETURNING *',
      [nama_kategori, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error update kategori:', err.message);
    res.status(500).json({ error: 'Gagal mengubah kategori' });
  }
});

/**
 * DELETE - Hapus kategori berdasarkan ID
 * DELETE /api/kategori/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM kategori WHERE id_kategori=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error('Error delete kategori:', err.message);
    res.status(500).json({ error: 'Gagal menghapus kategori' });
  }
});

module.exports = router;
