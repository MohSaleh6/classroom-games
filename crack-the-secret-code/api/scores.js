import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'node:crypto';

const sql = neon(process.env.DATABASE_URL);
const cleanName = n => String(n ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
const nameKey = n => cleanName(n).toLowerCase();
const readBody = b => (typeof b === 'string' ? JSON.parse(b || '{}') : (b || {}));
const validResult = (p, s) => Number.isInteger(p) && p >= 0 && p <= 9 && Number.isInteger(s) && s >= 0 && s <= 3600;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    // List the class board
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, name, points, seconds, finished, (extract(epoch FROM created_at) * 1000)::bigint AS ts
        FROM scores ORDER BY finished DESC, points DESC, seconds ASC, created_at ASC LIMIT 300`;
      return res.status(200).json({
        scores: rows.map(r => ({ id: r.id, name: r.name, points: r.points, seconds: r.seconds, finished: r.finished, ts: Number(r.ts) }))
      });
    }

    // Start a game (reserve the name) or, if offline at start, save a finished game
    if (req.method === 'POST') {
      const b = readBody(req.body);
      const name = cleanName(b.name);
      if (!name) return res.status(400).json({ error: 'invalid' });
      if (b.points === undefined) {
        const token = randomBytes(16).toString('hex');
        const r = await sql`
          INSERT INTO scores (name, name_key, points, seconds, finished, token)
          VALUES (${name}, ${nameKey(name)}, 0, 0, false, ${token})
          ON CONFLICT (name_key) DO NOTHING RETURNING id`;
        if (!r.length) return res.status(409).json({ error: 'taken' });
        return res.status(201).json({ id: r[0].id, token });
      }
      const points = Number(b.points), seconds = Number(b.seconds);
      if (!validResult(points, seconds)) return res.status(400).json({ error: 'invalid' });
      const r = await sql`
        INSERT INTO scores (name, name_key, points, seconds, finished)
        VALUES (${name}, ${nameKey(name)}, ${points}, ${seconds}, true)
        ON CONFLICT (name_key) DO NOTHING RETURNING id`;
      if (!r.length) return res.status(409).json({ error: 'taken' });
      return res.status(201).json({ ok: true, id: r[0].id });
    }

    // Finish a reserved game (only once, only by the device that started it)
    if (req.method === 'PUT') {
      const b = readBody(req.body);
      const id = Number(b.id), points = Number(b.points), seconds = Number(b.seconds);
      if (!Number.isInteger(id) || typeof b.token !== 'string' || !validResult(points, seconds)) {
        return res.status(400).json({ error: 'invalid' });
      }
      const r = await sql`
        UPDATE scores SET points = ${points}, seconds = ${seconds}, finished = true, token = NULL
        WHERE id = ${id} AND token = ${b.token} AND finished = false RETURNING id`;
      if (!r.length) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT');
    return res.status(405).json({ error: 'method' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server' });
  }
}
