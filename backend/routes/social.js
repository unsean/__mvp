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

// Follow a user
router.post('/follow', authMiddleware, async (req, res) => {
  const { follow_user_id } = req.body;
  try {
    await pool.query('INSERT INTO follows (user_id, follow_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, follow_user_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to follow', details: err.message });
  }
});

// Get activity feed (recent bookings and reviews by followed users)
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id as user_id, u.name as user_name, b.restaurant_id, b.date, b.time, r.rating, r.comment, r.created_at as review_time
      FROM follows f
      LEFT JOIN bookings b ON f.follow_user_id = b.user_id
      LEFT JOIN reviews r ON f.follow_user_id = r.user_id
      JOIN users u ON f.follow_user_id = u.id
      WHERE f.user_id = $1
      ORDER BY COALESCE(b.date, r.created_at) DESC NULLS LAST
      LIMIT 30
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed', details: err.message });
  }
});

// Unfollow a user
router.post('/unfollow', authMiddleware, async (req, res) => {
  const { follow_user_id } = req.body;
  try {
    await pool.query('DELETE FROM follows WHERE user_id = $1 AND follow_user_id = $2', [req.user.id, follow_user_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to unfollow', details: err.message });
  }
});

// Get followers
router.get('/followers/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.id, u.name, u.avatar FROM follows f JOIN users u ON f.user_id = u.id WHERE f.follow_user_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch followers', details: err.message });
  }
});

// Get following
router.get('/following/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.id, u.name, u.avatar FROM follows f JOIN users u ON f.follow_user_id = u.id WHERE f.user_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch following', details: err.message });
  }
});

// Suggest users to follow (not already following, not self)
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, avatar FROM users WHERE id != $1 AND id NOT IN (
        SELECT follow_user_id FROM follows WHERE user_id = $1
      )
      ORDER BY RANDOM() LIMIT 10
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggestions', details: err.message });
  }
});

// Get favorites/bookmarks for user
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT r.* FROM favorites f JOIN restaurants r ON f.restaurant_id = r.id WHERE f.user_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites', details: err.message });
  }
});

// Add favorite
router.post('/favorite', authMiddleware, async (req, res) => {
  const { restaurant_id } = req.body;
  try {
    await pool.query('INSERT INTO favorites (user_id, restaurant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, restaurant_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to favorite', details: err.message });
  }
});

// Remove favorite
router.post('/unfavorite', authMiddleware, async (req, res) => {
  const { restaurant_id } = req.body;
  try {
    await pool.query('DELETE FROM favorites WHERE user_id = $1 AND restaurant_id = $2', [req.user.id, restaurant_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to unfavorite', details: err.message });
  }
});

module.exports = router;
