// server/routes/admin.js
const express = require('express');
const db = require('../db');
const { normalizeImageInput } = require('../image-data');
const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin') return res.json({ success: false, message: 'Admin only.' });
  next();
}

router.get('/stats', requireAdmin, async (req, res) => {
  const [[p]] = await db.query('SELECT COUNT(*) as c FROM places');
  const [[u]] = await db.query("SELECT COUNT(*) as c FROM users WHERE Role='tourist'");
  const [[r]] = await db.query('SELECT COUNT(*) as c FROM reviews');
  res.json({ success: true, places: p.c, users: u.c, reviews: r.c });
});

router.get('/places', requireAdmin, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM places ORDER BY Distance');
  res.json({ success: true, places: rows });
});

router.get('/places/:id', requireAdmin, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM places WHERE PlaceID=?', [req.params.id]);
  res.json({ success: true, place: rows[0] });
});

router.post('/places', requireAdmin, async (req, res) => {
  const { name, category, distance, description, hours, lat, lng, imageUrl, bestTime, travelTips, transport, accessibility, crowdLevel } = req.body;
  if (!name || !category || !distance || !description) return res.json({ success: false, message: 'Required fields missing.' });
  try {
    const normalizedImage = await normalizeImageInput(imageUrl);
    await db.query(
      'INSERT INTO places (Name,Category,Distance,Description,OpeningHours,Latitude,Longitude,ImageURL,BestTime,TravelTips,Transport,Accessibility,CrowdLevel) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [name, category, parseFloat(distance), description, hours||null, lat||null, lng||null, normalizedImage, bestTime||null, travelTips||null, transport||null, accessibility||null, crowdLevel||null]
    );
    res.json({ success: true, message: 'Place added!' });
  } catch (e) {
    res.json({ success: false, message: e.message || 'Failed to add place.' });
  }
});

router.put('/places/:id', requireAdmin, async (req, res) => {
  const { name, category, distance, description, hours, lat, lng, imageUrl, bestTime, travelTips, transport, accessibility, crowdLevel } = req.body;
  try {
    const normalizedImage = await normalizeImageInput(imageUrl);
    await db.query(
      'UPDATE places SET Name=?,Category=?,Distance=?,Description=?,OpeningHours=?,Latitude=?,Longitude=?,ImageURL=?,BestTime=?,TravelTips=?,Transport=?,Accessibility=?,CrowdLevel=? WHERE PlaceID=?',
      [name, category, parseFloat(distance), description, hours||null, lat||null, lng||null, normalizedImage, bestTime||null, travelTips||null, transport||null, accessibility||null, crowdLevel||null, req.params.id]
    );
    res.json({ success: true, message: 'Updated!' });
  } catch (e) {
    res.json({ success: false, message: e.message || 'Failed to update place.' });
  }
});

router.delete('/places/:id', requireAdmin, async (req, res) => {
  await db.query('DELETE FROM places WHERE PlaceID=?', [req.params.id]);
  res.json({ success: true });
});

router.get('/users', requireAdmin, async (req, res) => {
  const [rows] = await db.query('SELECT UserID,Name,Email,Role,CreatedAt FROM users ORDER BY CreatedAt DESC');
  res.json({ success: true, users: rows });
});

router.get('/reviews', requireAdmin, async (req, res) => {
  const [rows] = await db.query(`SELECT r.*, p.Name as PlaceName FROM reviews r JOIN places p ON r.PlaceID=p.PlaceID ORDER BY r.CreatedAt DESC`);
  res.json({ success: true, reviews: rows });
});

router.delete('/reviews/:id', requireAdmin, async (req, res) => {
  await db.query('DELETE FROM reviews WHERE ReviewID=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
