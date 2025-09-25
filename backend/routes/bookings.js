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

// Create booking
router.post('/', authMiddleware, async (req, res) => {
  const { restaurant_id, date, time, guests } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO bookings (user_id, restaurant_id, date, time, guests) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, restaurant_id, date, time, guests]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Booking failed', details: err.message });
  }
});

// Get my bookings
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
  }
});

module.exports = router;
