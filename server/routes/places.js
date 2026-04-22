// server/routes/places.js
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let q = 'SELECT * FROM places WHERE 1=1';
    const p = [];
    if (category && category !== 'all') { q += ' AND Category=?'; p.push(category); }
    if (search) { q += ' AND Name LIKE ?'; p.push(`%${search}%`); }
    q += ' ORDER BY Distance ASC';
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
