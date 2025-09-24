const pool = require('../config/db');

// Ambil semua kategori
async function getAllKategori() {
  const result = await pool.query('SELECT * FROM kategori ORDER BY id_kategori ASC');
  return result.rows;
}

// Tambah kategori
async function addKategori(nama) {
  const result = await pool.query(
    'INSERT INTO kategori (nama_kategori) VALUES ($1) RETURNING *',
    [nama]
  );
  return result.rows[0];
}

module.exports = { getAllKategori, addKategori };
