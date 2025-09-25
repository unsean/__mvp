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

// Fetch notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// Mark as read
router.post('/read', authMiddleware, async (req, res) => {
  const { notification_id } = req.body;
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [notification_id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to mark as read', details: err.message });
  }
});

// Send notification (for admin or system use)
router.post('/send', async (req, res) => {
  const { user_id, content } = req.body;
  try {
    await pool.query('INSERT INTO notifications (user_id, content) VALUES ($1, $2)', [user_id, content]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to send notification', details: err.message });
  }
});

module.exports = router;
