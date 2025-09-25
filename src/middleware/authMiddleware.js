const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token tidak tersedia" });
  }

  const token = authHeader.split(" ")[1]; // format: "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan info user (id_admin, role, dll.)
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token tidak valid" });
  }
}

module.exports = verifyToken;
