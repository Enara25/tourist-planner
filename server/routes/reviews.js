// server/routes/reviews.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// GET reviews for a place
router.get('/:placeId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reviews WHERE PlaceID=? ORDER BY CreatedAt DESC', [req.params.placeId]);
    const [[{ avg }]] = await db.query(
      'SELECT AVG(Rating) as avg FROM reviews WHERE PlaceID=?', [req.params.placeId]);
    res.json({ success: true, reviews: rows, average: avg ? parseFloat(avg).toFixed(1) : null });
  } catch(e) { res.json({ success: false, reviews: [] }); }
});

// POST submit a review
router.post('/', async (req, res) => {
  try {
    const { placeId, authorName, rating, body } = req.body;
    if (!placeId || !authorName || !rating) return res.json({ success: false, message: 'Name and rating required.' });
    if (rating < 1 || rating > 5) return res.json({ success: false, message: 'Rating must be 1–5.' });
    const userId = req.session?.userId || null;
    await db.query('INSERT INTO reviews (PlaceID,UserID,AuthorName,Rating,Body) VALUES (?,?,?,?,?)',
      [placeId, userId, authorName, rating, body || null]);
    res.json({ success: true, message: 'Review submitted!' });
  } catch(e) { res.json({ success: false, message: 'Failed to submit.' }); }
});

module.exports = router;
