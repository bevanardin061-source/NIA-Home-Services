const { pool, ensureSchema } = require('../lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { name, email, phone = '', service, preferred_date = '', details = '' } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 120) {
    return res.status(400).json({ error: 'Please enter your full name.' });
  }
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (typeof service !== 'string' || !service.trim() || service.length > 120) {
    return res.status(400).json({ error: 'Please choose the service you need.' });
  }
  if (typeof phone !== 'string' || phone.length > 40 ||
      typeof preferred_date !== 'string' || preferred_date.length > 120 ||
      typeof details !== 'string' || details.length > 4000) {
    return res.status(400).json({ error: 'One of the fields is too long. Please shorten it and try again.' });
  }

  try {
    await ensureSchema();
    const result = await pool.query(
      `INSERT INTO bookings(name, email, phone, service, preferred_date, details)
       VALUES($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
      [name.trim(), email.trim(), phone.trim(), service.trim(), preferred_date.trim(), details.trim()],
    );
    return res.status(201).json({
      message: 'Booking request received',
      booking_id: result.rows[0].id,
      received_at: result.rows[0].created_at,
    });
  } catch (error) {
    console.error('Booking save failed:', error.message);
    return res.status(503).json({ error: 'We could not save your request right now. Please try again shortly.' });
  }
};
