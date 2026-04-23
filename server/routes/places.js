// server/routes/places.js
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let q = `
      SELECT
        p.*,
        ROUND(AVG(r.Rating), 1) AS AverageRating,
        COUNT(r.ReviewID) AS ReviewCount
      FROM places p
      LEFT JOIN reviews r ON r.PlaceID = p.PlaceID
      WHERE 1=1
    `;
    const p = [];
    if (category && category !== 'all') { q += ' AND p.Category=?'; p.push(category); }
    if (search) { q += ' AND p.Name LIKE ?'; p.push(`%${search}%`); }
    q += ' GROUP BY p.PlaceID ORDER BY p.Distance ASC';
    const [places] = await db.query(q, p);
    res.json({ success: true, places });
  } catch(e) { res.json({ success: false, places: [] }); }
});

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT Category FROM places ORDER BY Category');
    res.json({ success: true, categories: rows.map(r => r.Category) });
  } catch(e) { res.json({ success: false, categories: [] }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM places WHERE PlaceID=?', [req.params.id]);
    if (!rows.length) return res.json({ success: false, message: 'Not found.' });
    res.json({ success: true, place: rows[0] });
  } catch(e) { res.json({ success: false }); }
});

module.exports = router;
