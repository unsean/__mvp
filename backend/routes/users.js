const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');
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

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
});

// Update profile
router.put('/me', authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

// Get another user's public profile
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

module.exports = router;
