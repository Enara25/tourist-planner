// server/db.js
const mysql = require("mysql2/promise");
const isProduction = process.env.NODE_ENV === "production";
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(
  process.env.DB_PORT || (!isProduction ? process.env.PORT : "") || 3306,
);
const dbConnectionLimit = Number(
  process.env.DB_CONNECTION_LIMIT || (isProduction ? 2 : 10),
);
const globalPoolKey = "__touristPlannerDbPool";

if (isProduction && !process.env.DB_PORT && process.env.PORT) {
  console.warn(
    "⚠️ DB_PORT is not set. PORT is reserved for the app runtime on platforms like Vercel and is not used for MySQL.",
  );
}

if (!globalThis[globalPoolKey]) {
  globalThis[globalPoolKey] = mysql.createPool({
    host: dbHost,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tourist_planner",
    port: dbPort,
    waitForConnections: true,
    connectionLimit: dbConnectionLimit,
    maxIdle: 1,
    idleTimeout: 10000,
    connectTimeout: 10000,
    enableKeepAlive: true,
  });
  console.log(
    `✅ MySQL pool created for ${dbHost}:${dbPort} (pool limit ${dbConnectionLimit})`,
  );
}

module.exports = globalThis[globalPoolKey];
