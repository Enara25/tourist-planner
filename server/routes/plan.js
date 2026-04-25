// server/routes/plan.js
const express = require('express');
const db = require('../db');
const router = express.Router();
const PLAN_ROUTE_TIMEOUT_MS = Number(process.env.PLAN_ROUTE_TIMEOUT_MS || 15000);

function requireLogin(req, res, next) {
  if (!req.session.userId) return respondJson(res, { success: false, message: 'Login required.' }, 401);
  next();
}

function respondJson(res, payload, status = 200) {
  if (!res.headersSent) {
    res.status(status).json(payload);
  }
}

function logPlanError(req, error) {
  console.error(
    `[plan] ${req.method} ${req.originalUrl} failed for user ${req.session?.userId || 'guest'}:`,
    error.code || error.message || error,
  );
}

function getStatusCode(error) {
  if (error?.code === 'PROTOCOL_SEQUENCE_TIMEOUT' || error?.code === 'ETIMEDOUT') {
    return 504;
  }
  if (error?.code === 'POOL_ENQUEUELIMIT') {
    return 503;
  }
  return 500;
}

router.use((req, res, next) => {
  const timer = setTimeout(() => {
    console.error(
      `[plan] ${req.method} ${req.originalUrl} exceeded ${PLAN_ROUTE_TIMEOUT_MS}ms for user ${req.session?.userId || 'guest'}`,
    );
    respondJson(res, {
      success: false,
      message: 'Plan request timed out. Please try again.'
    }, 504);
  }, PLAN_ROUTE_TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  next();
});

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
    respondJson(res, { success: true, planId, items });
  } catch (e) {
    logPlanError(req, e);
    respondJson(res, { success: false, items: [], message: 'Failed to load plan.' }, getStatusCode(e));
  }
});

// POST add to draft
router.post('/add', requireLogin, async (req, res) => {
  try {
    const { placeId } = req.body;
    const planId = await getOrCreateDraft(req.session.userId);
    const [ex] = await db.query('SELECT DetailID FROM plan_details WHERE PlanID=? AND PlaceID=?', [planId, placeId]);
    if (ex.length) return respondJson(res, { success: false, message: 'Already in your plan.' });
    const [[{ cnt }]] = await db.query('SELECT COUNT(*) as cnt FROM plan_details WHERE PlanID=?', [planId]);
    await db.query('INSERT INTO plan_details (PlanID,PlaceID,OrderIndex) VALUES (?,?,?)', [planId, placeId, cnt]);
    respondJson(res, { success: true });
  } catch (e) {
    logPlanError(req, e);
    respondJson(res, { success: false, message: 'Failed to add place to plan.' }, getStatusCode(e));
  }
});

// DELETE remove item
router.delete('/remove/:detailId', requireLogin, async (req, res) => {
  try {
    await db.query('DELETE FROM plan_details WHERE DetailID=?', [req.params.detailId]);
    respondJson(res, { success: true });
  } catch (e) {
    logPlanError(req, e);
    respondJson(res, { success: false, message: 'Failed to remove plan item.' }, getStatusCode(e));
  }
});

// DELETE clear draft
router.delete('/clear', requireLogin, async (req, res) => {
  try {
    const planId = await getOrCreateDraft(req.session.userId);
    await db.query('DELETE FROM plan_details WHERE PlanID=?', [planId]);
    respondJson(res, { success: true });
  } catch (e) {
    logPlanError(req, e);
    respondJson(res, { success: false, message: 'Failed to clear plan.' }, getStatusCode(e));
  }
});

// POST save draft as named trip
router.post('/save', requireLogin, async (req, res) => {
  try {
    const { name } = req.body;
    const draftId = await getOrCreateDraft(req.session.userId);
    const [items] = await db.query('SELECT * FROM plan_details WHERE PlanID=?', [draftId]);
    if (!items.length) return respondJson(res, { success: false, message: 'Your plan is empty.' });
    const [r] = await db.query('INSERT INTO visit_plans (UserID, PlanName, IsDraft) VALUES (?,?,0)', [req.session.userId, name || 'My Day Plan']);
    const newPlanId = r.insertId;
    for (const item of items) {
      await db.query('INSERT INTO plan_details (PlanID,PlaceID,OrderIndex) VALUES (?,?,?)', [newPlanId, item.PlaceID, item.OrderIndex]);
    }
    respondJson(res, { success: true, planId: newPlanId });
  } catch (e) {
    logPlanError(req, e);
    respondJson(res, { success: false, message: 'Save failed.' }, getStatusCode(e));
  }
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
    respondJson(res, { success: true, trips });
  } catch (e) {
    logPlanError(req, e);
    respondJson(res, { success: false, trips: [], message: 'Failed to load saved trips.' }, getStatusCode(e));
  }
});

// GET load saved trip into draft
router.get('/load/:planId', requireLogin, async (req, res) => {
  try {
    const [plans] = await db.query('SELECT * FROM visit_plans WHERE PlanID=? AND UserID=?', [req.params.planId, req.session.userId]);
    if (!plans.length) return respondJson(res, { success: false, message: 'Trip not found.' }, 404);
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
    respondJson(res, { success: true, items });
  } catch (e) {
    logPlanError(req, e);
    respondJson(res, { success: false, message: 'Load failed.' }, getStatusCode(e));
  }
});

// DELETE a saved trip
router.delete('/saved/:planId', requireLogin, async (req, res) => {
  try {
    await db.query('DELETE FROM visit_plans WHERE PlanID=? AND UserID=? AND IsDraft=0', [req.params.planId, req.session.userId]);
    respondJson(res, { success: true });
  } catch (e) {
    logPlanError(req, e);
    respondJson(res, { success: false, message: 'Failed to delete trip.' }, getStatusCode(e));
  }
});

module.exports = router;
