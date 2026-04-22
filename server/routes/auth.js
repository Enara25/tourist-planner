// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.json({ success: false, message: 'All fields required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.json({ success: false, message: 'Invalid email.' });
  if (password.length < 6) return res.json({ success: false, message: 'Password must be 6+ chars.' });
  try {
    const [ex] = await db.query('SELECT UserID FROM users WHERE Email=?', [email]);
    if (ex.length) return res.json({ success: false, message: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (Name,Email,Password,Role) VALUES (?,?,?,"tourist")', [name, email, hashed]);
    res.json({ success: true, message: 'Account created! You can now login.' });
  } catch(e) { res.json({ success: false, message: 'Registration failed.' }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.json({ success: false, message: 'All fields required.' });
  try {
    const [users] = await db.query('SELECT * FROM users WHERE Email=?', [email]);
    if (!users.length) return res.json({ success: false, message: 'Invalid email or password.' });
    const user = users[0];
    const valid = await bcrypt.compare(password, user.Password);
    if (!valid) return res.json({ success: false, message: 'Invalid email or password.' });
    req.session.userId = user.UserID;
    req.session.name = user.Name;
    req.session.role = user.Role;
    res.json({ success: true, user: { id: user.UserID, name: user.Name, role: user.Role } });
  } catch(e) { res.json({ success: false, message: 'Login failed.' }); }
});

router.post('/logout', (req, res) => { req.session.destroy(); res.json({ success: true }); });

router.get('/me', (req, res) => {
  if (req.session.userId) res.json({ loggedIn: true, name: req.session.name, role: req.session.role, id: req.session.userId });
  else res.json({ loggedIn: false });
});

module.exports = router;
