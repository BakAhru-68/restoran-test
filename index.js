require("dotenv").config();
const express = require("express");
const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Import konfigurasi database (supaya koneksi aktif)
require("./src/config/db");

// Import semua routes
const kategoriRoutes = require("./src/routes/kategoriRoutes");
const produkRoutes = require("./src/routes/produkRoutes");
const pelangganRoutes = require("./src/routes/pelangganRoutes");
const pesananRoutes = require("./src/routes/pesananRoutes");
const detailPesananRoutes = require("./src/routes/detailPesananRoutes");
const transaksiRoutes = require("./src/routes/transaksiRoutes");
const laporanRoutes = require("./src/routes/laporanRoutes");

// Prefix semua route pakai /api/...
app.use("/api/kategori", kategoriRoutes);
app.use("/api/produk", produkRoutes);
app.use("/api/pelanggan", pelangganRoutes);
app.use("/api/pesanan", pesananRoutes);
app.use("/api/detail-pesanan", detailPesananRoutes);
app.use("/api/transaksi", transaksiRoutes);
app.use("/api/laporan", laporanRoutes);

// Route tes sederhana
app.get("/", (req, res) => {
  res.json({ message: "✅ API Restoran Dapur Bunda Bahagia aktif!" });
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
