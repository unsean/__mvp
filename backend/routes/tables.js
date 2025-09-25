const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all tables for a restaurant
router.get('/', async (req, res) => {
  const { restaurant_id } = req.query;
  try {
    const result = await pool.query('SELECT * FROM tables WHERE restaurant_id = $1', [restaurant_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tables', details: err.message });
  }
});

module.exports = router;
