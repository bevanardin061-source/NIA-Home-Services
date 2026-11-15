const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));
async function init(){
 await pool.query(`CREATE TABLE IF NOT EXISTS bookings (
 id BIGSERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL,
 phone VARCHAR(40), service VARCHAR(120) NOT NULL, preferred_date VARCHAR(120),
 details TEXT, status VARCHAR(24) NOT NULL DEFAULT 'new', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
}
app.get('/api/health', async (_req,res)=>{try{await pool.query('SELECT 1');res.json({status:'ok',database:'connected'});}catch{res.status(503).json({status:'error',database:'unavailable'});}});
app.post('/api/bookings', async (req,res)=>{
 const {name,email,phone='',service,preferred_date='',details=''} = req.body || {};
 if(typeof name!=='string'||name.trim().length<2||name.trim().length>120) return res.status(400).json({error:'Please enter your full name.'});
 if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email)||email.length>254) return res.status(400).json({error:'Please enter a valid email address.'});
 if(typeof service!=='string'||!service.trim()||service.length>120) return res.status(400).json({error:'Please choose the service you need.'});
 if(typeof phone!=='string'||phone.length>40||typeof preferred_date!=='string'||preferred_date.length>120||typeof details!=='string'||details.length>4000) return res.status(400).json({error:'One of the fields is too long. Please shorten it and try again.'});
 try { const q=await pool.query('INSERT INTO bookings(name,email,phone,service,preferred_date,details) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,created_at',[name.trim(),email.trim(),phone.trim(),service.trim(),preferred_date.trim(),details.trim()]);
 res.status(201).json({message:'Booking request received',booking_id:q.rows[0].id,received_at:q.rows[0].created_at});
 } catch(err){ console.error('Booking save failed:',err.message);res.status(503).json({error:'We could not save your request right now. Please try again shortly.'}); }
});
const port=process.env.PORT||3000;
init().then(()=>app.listen(port,'0.0.0.0',()=>console.log(`NIA API listening on ${port}`))).catch(err=>{console.error('Database initialization failed:',err);process.exit(1)});
process.on('SIGTERM',async()=>{await pool.end();process.exit(0)});
