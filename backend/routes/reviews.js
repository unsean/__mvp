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

// Add review
router.post('/', authMiddleware, async (req, res) => {
  const { restaurant_id, rating, comment } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, restaurant_id, rating, comment]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Review failed', details: err.message });
  }
});

// Get reviews for a restaurant
router.get('/restaurant/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE restaurant_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});

// Edit a review
router.put('/:id', async (req, res) => {
  const { rating, comment } = req.body;
  try {
    await pool.query('UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3', [rating, comment, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update review', details: err.message });
  }
});

// Delete a review
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete review', details: err.message });
  }
});

// Like/upvote a review
router.post('/like/:id', async (req, res) => {
  try {
    await pool.query('INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)', [req.user.id, 'like_review', JSON.stringify({ review_id: req.params.id })]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to like review', details: err.message });
  }
});

module.exports = router;
