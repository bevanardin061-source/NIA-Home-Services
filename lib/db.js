const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let schemaReady;

async function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!schemaReady) {
    schemaReady = pool.query(`CREATE TABLE IF NOT EXISTS bookings (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(254) NOT NULL,
      phone VARCHAR(40),
      service VARCHAR(120) NOT NULL,
      preferred_date VARCHAR(120),
      details TEXT,
      status VARCHAR(24) NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`).catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }

  await schemaReady;
}

module.exports = { pool, ensureSchema };
