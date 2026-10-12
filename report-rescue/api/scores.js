import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'node:crypto';

const sql = neon(process.env.DATABASE_URL);
const MAX_POINTS = 200, MAX_SECONDS = 900;
const cleanName = n => String(n ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
const nameKey = n => cleanName(n).toLowerCase();
const readBody = b => (typeof b === 'string' ? JSON.parse(b || '{}') : (b || {}));
const valid = (p, s) => Number.isInteger(p) && p >= 0 && p <= MAX_POINTS && Number.isInteger(s) && s >= 0 && s <= MAX_SECONDS;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT id, name, points, seconds, finished, (extract(epoch FROM created_at) * 1000)::bigint AS ts
        FROM rr_scores ORDER BY finished DESC, points DESC, seconds ASC, created_at ASC LIMIT 300`;
      return res.status(200).json({ scores: rows.map(r => ({ id: r.id, name: r.name, points: r.points, seconds: r.seconds, finished: r.finished, ts: Number(r.ts) })) });
    }
    if (req.method === 'POST') {
      const b = readBody(req.body); const name = cleanName(b.name);
      if (!name) return res.status(400).json({ error: 'invalid' });
      if (b.points === undefined) {
        const token = randomBytes(16).toString('hex');
        const r = await sql`INSERT INTO rr_scores (name, name_key, points, seconds, finished, token)
          VALUES (${name}, ${nameKey(name)}, 0, ${MAX_SECONDS}, false, ${token}) ON CONFLICT (name_key) DO NOTHING RETURNING id`;
        if (!r.length) return res.status(409).json({ error: 'taken' });
        return res.status(201).json({ id: r[0].id, token });
      }
      const p = Number(b.points), s = Number(b.seconds);
      if (!valid(p, s)) return res.status(400).json({ error: 'invalid' });
      const r = await sql`INSERT INTO rr_scores (name, name_key, points, seconds, finished)
        VALUES (${name}, ${nameKey(name)}, ${p}, ${s}, true) ON CONFLICT (name_key) DO NOTHING RETURNING id`;
      if (!r.length) return res.status(409).json({ error: 'taken' });
      return res.status(201).json({ ok: true, id: r[0].id });
    }
    if (req.method === 'PUT') {
      const b = readBody(req.body); const id = Number(b.id), p = Number(b.points), s = Number(b.seconds);
      if (!Number.isInteger(id) || typeof b.token !== 'string' || !valid(p, s)) return res.status(400).json({ error: 'invalid' });
      const r = await sql`UPDATE rr_scores SET points = ${p}, seconds = ${s}, finished = true, token = NULL
        WHERE id = ${id} AND token = ${b.token} AND finished = false RETURNING id`;
      if (!r.length) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, PUT');
    return res.status(405).json({ error: 'method' });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'server' }); }
}
