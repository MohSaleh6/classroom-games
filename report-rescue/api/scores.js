import { randomBytes } from 'node:crypto';
import { sql, ensureTable, readBody } from './_db.js';

const cleanName = n => String(n ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
const nameKey = n => cleanName(n).toLowerCase();

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await ensureTable();
    if (req.method === 'GET') {
      const rows = await sql`SELECT id, name, boxes, colour, support, plan_b, confirmed FROM mb_players ORDER BY name_key LIMIT 300`;
      return res.status(200).json({ players: rows.map(r => ({ id: r.id, name: r.name, boxes: r.boxes, colour: r.colour, support: r.support, planB: r.plan_b, confirmed: r.confirmed })) });
    }
    if (req.method === 'POST') {
      const name = cleanName(readBody(req.body).name);
      if (!name) return res.status(400).json({ error: 'invalid' });
      const token = randomBytes(16).toString('hex');
      const r = await sql`INSERT INTO mb_players (name, name_key, token) VALUES (${name}, ${nameKey(name)}, ${token})
        ON CONFLICT (name_key) DO NOTHING RETURNING id`;
      if (!r.length) return res.status(409).json({ error: 'taken' });
      return res.status(201).json({ id: r[0].id, token });
    }
    if (req.method === 'PUT') {
      // Student-reported progress: which boxes they say they finished, plus their robot colour and modes.
      const b = readBody(req.body); const id = Number(b.id), boxes = Number(b.boxes), colour = Number(b.colour);
      if (!Number.isInteger(id) || typeof b.token !== 'string' || !Number.isInteger(boxes) || boxes < 0 || boxes > 63
        || !Number.isInteger(colour) || colour < 0 || colour > 5) return res.status(400).json({ error: 'invalid' });
      const r = await sql`UPDATE mb_players SET boxes = ${boxes}, colour = ${colour}, support = ${b.support === true}, plan_b = ${b.planB === true}, updated_at = now()
        WHERE id = ${id} AND token = ${b.token} RETURNING confirmed`;
      if (!r.length) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json({ ok: true, confirmed: r[0].confirmed });
    }
    res.setHeader('Allow', 'GET, POST, PUT');
    return res.status(405).json({ error: 'method' });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'server' }); }
}
