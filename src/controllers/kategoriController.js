// src/controllers/kategoriController.js
const db = require('../config/db');

// CREATE kategori
exports.createKategori = (req, res) => {
  const { nama_kategori } = req.body;
  db.query(
    'INSERT INTO kategori (nama_kategori) VALUES (?)',
    [nama_kategori],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id_kategori: result.insertId, nama_kategori });
    }
  );
};

// READ semua kategori
exports.getAllKategori = (req, res) => {
  db.query('SELECT * FROM kategori', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// UPDATE kategori
exports.updateKategori = (req, res) => {
  const { id } = req.params;
  const { nama_kategori } = req.body;
  db.query(
    'UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?',
    [nama_kategori, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Kategori berhasil diperbarui' });
    }
  );
};

// DELETE kategori
exports.deleteKategori = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM kategori WHERE id_kategori = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Kategori berhasil dihapus' });
  });
};
