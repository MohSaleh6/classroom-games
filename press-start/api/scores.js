import { randomBytes } from 'node:crypto';
import { sql, ensureTable, readBody, MAX_POINTS, MAX_SECONDS } from './_db.js';

const cleanName = n => String(n ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
const nameKey = n => cleanName(n).toLowerCase();
const valid = (p, s, a) => Number.isInteger(p) && p >= 0 && p <= MAX_POINTS && Number.isInteger(s) && s >= 0 && s <= MAX_SECONDS
  && Number.isInteger(a) && a >= 0 && a <= 11;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await ensureTable();
    if (req.method === 'GET') {
      const rows = await sql`SELECT id, name, points, seconds, approved, finished FROM ps_scores
        ORDER BY finished DESC, points DESC, seconds ASC, created_at ASC LIMIT 300`;
      return res.status(200).json({ scores: rows });
    }
    if (req.method === 'POST') { // reserve a name: one play per name
      const name = cleanName(readBody(req.body).name);
      if (!name) return res.status(400).json({ error: 'invalid' });
      const token = randomBytes(16).toString('hex');
      const r = await sql`INSERT INTO ps_scores (name, name_key, token) VALUES (${name}, ${nameKey(name)}, ${token})
        ON CONFLICT (name_key) DO NOTHING RETURNING id`;
      if (!r.length) return res.status(409).json({ error: 'taken' });
      return res.status(201).json({ id: r[0].id, token });
    }
    if (req.method === 'PUT') { // save the final score once
      const b = readBody(req.body); const id = Number(b.id), p = Number(b.points), s = Number(b.seconds), a = Number(b.approved);
      if (!Number.isInteger(id) || typeof b.token !== 'string' || !valid(p, s, a)) return res.status(400).json({ error: 'invalid' });
      const r = await sql`UPDATE ps_scores SET points = ${p}, seconds = ${s}, approved = ${a}, finished = true, token = NULL
        WHERE id = ${id} AND token = ${b.token} AND finished = false RETURNING id`;
      if (!r.length) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, PUT');
    return res.status(405).json({ error: 'method' });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'server' }); }
}
