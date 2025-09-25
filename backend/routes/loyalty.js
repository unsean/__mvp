const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get loyalty points
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT points FROM loyalty WHERE user_id = $1', [req.user.id]);
    res.json(result.rows[0] || { points: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loyalty points', details: err.message });
  }
});

// Redeem points
router.post('/redeem', authMiddleware, async (req, res) => {
  const { points } = req.body;
  try {
    const result = await pool.query('UPDATE loyalty SET points = points - $1 WHERE user_id = $2 RETURNING points', [points, req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Failed to redeem points', details: err.message });
  }
});

// Get loyalty transaction history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM activity_log WHERE user_id = $1 AND (action = $2 OR action = $3) ORDER BY created_at DESC LIMIT 50',
      [req.user.id, 'earn_points', 'redeem_points']
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loyalty history', details: err.message });
  }
});

module.exports = router;
