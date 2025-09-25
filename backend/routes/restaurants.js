const express = require('express');
const pool = require('../db');
const router = express.Router();

// List/search restaurants
router.get('/', async (req, res) => {
  try {
    const { q, cuisine, price, location } = req.query;
    let query = 'SELECT * FROM restaurants WHERE 1=1';
    const params = [];
    if (q) {
      params.push(`%${q}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    if (cuisine) {
      params.push(cuisine);
      query += ` AND cuisine = $${params.length}`;
    }
    if (price) {
      params.push(price);
      query += ` AND price = $${params.length}`;
    }
    // Location filter could be improved with geospatial queries
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[restaurants.js] Failed to load restaurants:', err);
    res.status(500).json({ error: 'Failed to load restaurants', details: err.message });
  }
});

// Get restaurant details
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(404).json({ error: 'Restaurant not found' });
  }
});

// Get real-time table availability for a restaurant
router.get('/:id/availability', async (req, res) => {
  const restaurantId = req.params.id;
  const { date, time } = req.query;
  try {
    // Get all tables for the restaurant
    const tables = await pool.query('SELECT * FROM tables WHERE restaurant_id = $1', [restaurantId]);
    // Get all bookings for the given date and time
    const bookings = await pool.query('SELECT table_id FROM bookings WHERE restaurant_id = $1 AND date = $2 AND time = $3', [restaurantId, date, time]);
    const bookedTableIds = bookings.rows.map(b => b.table_id);
    const availableTables = tables.rows.filter(t => !bookedTableIds.includes(t.id));
    res.json(availableTables);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch availability', details: err.message });
  }
});

module.exports = router;
