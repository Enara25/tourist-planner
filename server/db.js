// server/db.js
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost', user: 'root', password: '', database: 'tourist_planner',
  waitForConnections: true, connectionLimit: 10
});
pool.getConnection()
  .then(c => { console.log('✅ MySQL connected!'); c.release(); })
  .catch(e => console.error('❌ DB Error:', e.message));
module.exports = pool;
