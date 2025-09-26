require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Koneksi DB
require("./src/config/db");

// Import routes
const kategoriRoutes = require("./src/routes/kategoriRoutes");
const produkRoutes = require("./src/routes/produkRoutes");
const pelangganRoutes = require("./src/routes/pelangganRoutes");
const pesananRoutes = require("./src/routes/pesananRoutes");
const detailPesananRoutes = require("./src/routes/detailPesananRoutes");
const transaksiRoutes = require("./src/routes/transaksiRoutes");
const laporanRoutes = require("./src/routes/laporanRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

// Register routes
app.use("/api/kategori", kategoriRoutes);
app.use("/api/produk", produkRoutes);
app.use("/api/pelanggan", pelangganRoutes);
app.use("/api/pesanan", pesananRoutes);
app.use("/api/detail_pesanan", detailPesananRoutes);
app.use("/api/transaksi", transaksiRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);

// Tes route
app.get("/", (req, res) => {
  res.json({ message: "✅ API Restoran Dapur Bunda Bahagia aktif!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
