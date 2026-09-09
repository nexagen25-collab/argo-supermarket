const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');

const SECRET = process.env.JWT_SECRET || 'freshbasket-dev-secret-change-me';

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = verifyToken(token);
    const user = getUserById(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { SECRET, sign, requireAuth, requireAdmin };