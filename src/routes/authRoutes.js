const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

// LOGIN ADMIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // cek username di tabel admin
    const result = await pool.query(
      "SELECT * FROM admin WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User tidak ditemukan" });
    }

    const user = result.rows[0];

    // bandingkan password (pastikan di DB sudah hash)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Password salah" });
    }

    // buat JWT
    const token = jwt.sign(
      { id_admin: user.id_admin, username: user.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      role: "admin",
      username: user.username,
      nama: user.nama,
    });
  } catch (err) {
    console.error("❌ Error login:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// authRoutes.js
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // cek user di DB
  const user = await db.query(
    "SELECT * FROM users WHERE username = $1 AND password = $2",
    [username, password]
  );

  if (user.rows.length === 0) {
    return res.status(401).json({ error: "Username atau password salah" });
  }

  const payload = {
    id: user.rows[0].id,
    username: user.rows[0].username,
    role: user.rows[0].role, // <-- simpan role di token
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, role: user.rows[0].role }); // <-- kirim role juga
});


module.exports = router;
