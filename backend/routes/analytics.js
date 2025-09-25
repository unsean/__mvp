const express = require('express');
const pool = require('../db');
const router = express.Router();

// User analytics (bookings, reviews, loyalty, favorites)
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [bookings, reviews, loyalty, favorites] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM bookings WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM reviews WHERE user_id = $1', [userId]),
      pool.query('SELECT points FROM loyalty WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM favorites WHERE user_id = $1', [userId]),
    ]);
    res.json({
      bookings: bookings.rows[0].count,
      reviews: reviews.rows[0].count,
      loyalty: loyalty.rows[0]?.points || 0,
      favorites: favorites.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user analytics', details: err.message });
  }
});

// Restaurant analytics (bookings, reviews, avg rating)
router.get('/restaurant/:id', async (req, res) => {
  try {
    const restId = req.params.id;
    const [bookings, reviews, avgRating] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM bookings WHERE restaurant_id = $1', [restId]),
      pool.query('SELECT COUNT(*) FROM reviews WHERE restaurant_id = $1', [restId]),
      pool.query('SELECT AVG(rating) FROM reviews WHERE restaurant_id = $1', [restId]),
    ]);
    res.json({
      bookings: bookings.rows[0].count,
      reviews: reviews.rows[0].count,
      avg_rating: avgRating.rows[0].avg || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurant analytics', details: err.message });
  }
});

module.exports = router;
