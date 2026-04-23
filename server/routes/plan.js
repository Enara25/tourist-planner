// server/routes/plan.js
const express = require('express');
const db = require('../db');
const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.json({ success: false, message: 'Login required.' });
  next();
}

async function getOrCreateDraft(userId) {
  let [plans] = await db.query(
    'SELECT * FROM visit_plans WHERE UserID=? AND IsDraft=1 ORDER BY CreatedDate DESC LIMIT 1',
    [userId]
  );
  if (!plans.length) {
    const [r] = await db.query('INSERT INTO visit_plans (UserID, IsDraft) VALUES (?,1)', [userId]);
    return r.insertId;
  }
  return plans[0].PlanID;
}

// GET current draft
router.get('/', requireLogin, async (req, res) => {
  try {
    const planId = await getOrCreateDraft(req.session.userId);
    const [items] = await db.query(
      `SELECT pd.DetailID, pd.OrderIndex, p.PlaceID, p.Name, p.Category, p.Distance,
              p.OpeningHours, p.Latitude, p.Longitude, p.ImageURL
       FROM plan_details pd JOIN places p ON pd.PlaceID=p.PlaceID
       WHERE pd.PlanID=? ORDER BY pd.OrderIndex`, [planId]);
    res.json({ success: true, planId, items });
  } catch(e) { res.json({ success: false, items: [] }); }
});

// POST add to draft
router.post('/add', requireLogin, async (req, res) => {
  try {
    const { placeId } = req.body;
    const planId = await getOrCreateDraft(req.session.userId);
    const [ex] = await db.query('SELECT DetailID FROM plan_details WHERE PlanID=? AND PlaceID=?', [planId, placeId]);
    if (ex.length) return res.json({ success: false, message: 'Already in your plan.' });
    const [[{ cnt }]] = await db.query('SELECT COUNT(*) as cnt FROM plan_details WHERE PlanID=?', [planId]);
    await db.query('INSERT INTO plan_details (PlanID,PlaceID,OrderIndex) VALUES (?,?,?)', [planId, placeId, cnt]);
    res.json({ success: true });
  } catch(e) { res.json({ success: false, message: 'Failed.' }); }
});

// DELETE remove item
router.delete('/remove/:detailId', requireLogin, async (req, res) => {
  try {
    await db.query('DELETE FROM plan_details WHERE DetailID=?', [req.params.detailId]);
    res.json({ success: true });
  } catch(e) { res.json({ success: false }); }
});

// DELETE clear draft
router.delete('/clear', requireLogin, async (req, res) => {
  try {
    const planId = await getOrCreateDraft(req.session.userId);
    await db.query('DELETE FROM plan_details WHERE PlanID=?', [planId]);
    res.json({ success: true });
  } catch(e) { res.json({ success: false }); }
});

// POST save draft as named trip
router.post('/save', requireLogin, async (req, res) => {
  try {
    const { name } = req.body;
    const draftId = await getOrCreateDraft(req.session.userId);
    const [items] = await db.query('SELECT * FROM plan_details WHERE PlanID=?', [draftId]);
    if (!items.length) return res.json({ success: false, message: 'Your plan is empty.' });
    const [r] = await db.query('INSERT INTO visit_plans (UserID, PlanName, IsDraft) VALUES (?,?,0)', [req.session.userId, name || 'My Day Plan']);
    const newPlanId = r.insertId;
    for (const item of items) {
      await db.query('INSERT INTO plan_details (PlanID,PlaceID,OrderIndex) VALUES (?,?,?)', [newPlanId, item.PlaceID, item.OrderIndex]);
    }
    res.json({ success: true, planId: newPlanId });
  } catch(e) { res.json({ success: false, message: 'Save failed.' }); }
});

// GET all saved (non-draft) trips
router.get('/saved', requireLogin, async (req, res) => {
  try {
    const [trips] = await db.query(
      `SELECT vp.PlanID, vp.PlanName, vp.CreatedDate, COUNT(pd.DetailID) as stopCount
       FROM visit_plans vp
       LEFT JOIN plan_details pd ON vp.PlanID = pd.PlanID
       WHERE vp.UserID=? AND vp.IsDraft=0
       GROUP BY vp.PlanID
       ORDER BY vp.CreatedDate DESC`, [req.session.userId]);
    res.json({ success: true, trips });
  } catch(e) { res.json({ success: false, trips: [] }); }
});

// GET load saved trip into draft
router.get('/load/:planId', requireLogin, async (req, res) => {
  try {
    const [plans] = await db.query('SELECT * FROM visit_plans WHERE PlanID=? AND UserID=?', [req.params.planId, req.session.userId]);
    if (!plans.length) return res.json({ success: false, message: 'Trip not found.' });
    const [items] = await db.query(
      `SELECT pd.DetailID, pd.OrderIndex, p.PlaceID, p.Name, p.Category,
              p.Distance, p.OpeningHours, p.Latitude, p.Longitude, p.ImageURL
       FROM plan_details pd JOIN places p ON pd.PlaceID=p.PlaceID
       WHERE pd.PlanID=? ORDER BY pd.OrderIndex`, [req.params.planId]);
    const draftId = await getOrCreateDraft(req.session.userId);
    await db.query('DELETE FROM plan_details WHERE PlanID=?', [draftId]);
    for (const item of items) {
      await db.query('INSERT INTO plan_details (PlanID,PlaceID,OrderIndex) VALUES (?,?,?)', [draftId, item.PlaceID, item.OrderIndex]);
    }
    res.json({ success: true, items });
  } catch(e) { res.json({ success: false, message: 'Load failed.' }); }
});

// DELETE a saved trip
router.delete('/saved/:planId', requireLogin, async (req, res) => {
  try {
    await db.query('DELETE FROM visit_plans WHERE PlanID=? AND UserID=? AND IsDraft=0', [req.params.planId, req.session.userId]);
    res.json({ success: true });
  } catch(e) { res.json({ success: false }); }
});

module.exports = router;