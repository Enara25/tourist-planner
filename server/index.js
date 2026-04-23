// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { attachAuth } = require('./auth');

const authRoutes = require('./routes/auth');
const placesRoutes = require('./routes/places');
const planRoutes = require('./routes/plan');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.set('trust proxy', 1);
app.use(attachAuth);

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/place', (req, res) => res.sendFile(path.join(__dirname, '../public/pages/place.html')));
app.get('/planner', (req, res) => res.sendFile(path.join(__dirname, '../public/pages/planner.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public/pages/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../public/pages/register.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../public/pages/admin.html')));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('');
    console.log('🌊 Visit Moratuwa — Tourist Day-Visit Planner');
    console.log(`👉 Open: http://localhost:${PORT}`);
    console.log('');
  });
}

module.exports = app;
