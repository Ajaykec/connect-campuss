// The ONLY file that knows how to connect to the database.
// To switch from Supabase to another PostgreSQL, change DATABASE_URL in .env.
const { Pool, types } = require('pg');
const { AppError } = require('../middleware/errorHandler');

types.setTypeParser(20, (v) => parseInt(v, 10));   // BIGINT ids -> JS number
types.setTypeParser(1700, (v) => parseFloat(v)); // NUMERIC -> JS number
types.setTypeParser(1082, (v) => v);             // DATE -> 'YYYY-MM-DD' string (no timezone shifts)

let pool = null;

function isConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!isConfigured()) {
    throw new AppError(503, 'Database is not configured. Set DATABASE_URL in your .env file (see .env.example).');
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Supabase requires SSL. Set DATABASE_SSL=true in .env for it; leave false for local Postgres.
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

function query(text, params) {
  return getPool().query(text, params);
}

// Runs several queries as one unit: all succeed, or none are saved.
async function withTransaction(work) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { isConfigured, query, withTransaction };
