// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust path to your User model

const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_env_secret';

async function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload should include user id (e.g. { id, email, iat, exp })
    // optionally populate from DB to check user still exists
    const user = await User.findById(payload.id).select('_id email name');
    if (!user) return res.status(401).json({ message: 'Invalid token - user not found' });

    req.user = { id: user._id, email: user.email, name: user.name };
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = auth;
