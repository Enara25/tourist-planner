// server/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.host, 
  user: process.env.user, 
  password: process.env.password, 
  database: process.env.database,
  ssl: { rejectUnauthorized: false },
});
pool.getConnection()
  .then(c => { console.log('✅ MySQL connected!'); c.release(); })
  .catch(e => console.error('❌ DB Error:', e.message));
module.exports = pool;
