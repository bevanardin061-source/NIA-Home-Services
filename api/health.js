const { pool, ensureSchema } = require('../lib/db');

module.exports = async function handler(_req, res) {
  try {
    await ensureSchema();
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
};
