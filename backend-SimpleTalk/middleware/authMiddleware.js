const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('🔥 Middleware terpanggil');
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // INI HARUS ADA
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

module.exports = authMiddleware;
