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
const dbQueueLimit = Number(
  process.env.DB_QUEUE_LIMIT || (isProduction ? 20 : 0),
);
const dbQueryTimeoutMs = Number(
  process.env.DB_QUERY_TIMEOUT_MS || (isProduction ? 12000 : 20000),
);
const dbSlowQueryMs = Number(
  process.env.DB_SLOW_QUERY_MS || 1500,
);
const globalPoolKey = "__touristPlannerDbPool";

if (isProduction && !process.env.DB_PORT && process.env.PORT) {
  console.warn(
    "⚠️ DB_PORT is not set.",
  );
}

if (!globalThis[globalPoolKey]) {
  const pool = mysql.createPool({
    host: dbHost,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tourist_planner",
    port: dbPort,
    waitForConnections: true,
    connectionLimit: dbConnectionLimit,
    queueLimit: dbQueueLimit,
    maxIdle: 1,
    idleTimeout: 10000,
    connectTimeout: 10000,
    enableKeepAlive: true,
  });

  const rawQuery = pool.query.bind(pool);
  pool.query = async (sql, values) => {
    const startedAt = Date.now();
    const queryOptions = typeof sql === "string"
      ? { sql, timeout: dbQueryTimeoutMs }
      : { timeout: dbQueryTimeoutMs, ...sql };

    try {
      return await rawQuery(queryOptions, values);
    } catch (error) {
      const sqlText = typeof queryOptions === "string"
        ? queryOptions
        : queryOptions.sql || "unknown";
      const compactSql = sqlText.replace(/\s+/g, " ").trim().slice(0, 160);
      console.error(
        `DB query failed after ${Date.now() - startedAt}ms: ${compactSql}`,
        error.code || error.message,
      );
      throw error;
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= dbSlowQueryMs) {
        const sqlText = typeof queryOptions === "string"
          ? queryOptions
          : queryOptions.sql || "unknown";
        const compactSql = sqlText.replace(/\s+/g, " ").trim().slice(0, 160);
        console.warn(`Slow DB query (${elapsed}ms): ${compactSql}`);
      }
    }
  };

  globalThis[globalPoolKey] = pool;
  console.log(
    `✅ MySQL pool created for ${dbHost}:${dbPort} (pool limit ${dbConnectionLimit}, queue limit ${dbQueueLimit}, query timeout ${dbQueryTimeoutMs}ms)`,
  );
}

module.exports = globalThis[globalPoolKey];
