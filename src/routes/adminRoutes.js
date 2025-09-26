const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET semua admin
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT id_admin, nama FROM admin");
    res.json(result.rows); // ambil array dari result.rows
  } catch (err) {
    console.error("Error ambil data admin:", err);
    res.status(500).json({ message: "Gagal ambil data admin" });
  }
});

module.exports = router;
