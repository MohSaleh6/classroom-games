import { timingSafeEqual } from 'node:crypto';
import { sql, ensureTable, readBody } from './_db.js';

function pinOk(p) { const a = Buffer.from(String(p ?? '')), b = Buffer.from(String(process.env.TEACHER_PIN ?? '')); return b.length > 0 && a.length === b.length && timingSafeEqual(a, b); }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method' }); }
  try {
    const b = readBody(req.body);
    if (!pinOk(b.pin)) { await new Promise(r => setTimeout(r, 900)); return res.status(401).json({ error: 'pin' }); }
    await ensureTable();
    const id = Number(b.id);
    if (b.action === 'check') return res.status(200).json({ ok: true });
    if (b.action === 'confirm') { // teacher has checked the Word file and confirms the badge
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' });
      await sql`UPDATE mb_players SET confirmed = ${b.on !== false} WHERE id = ${id}`; return res.status(200).json({ ok: true });
    }
    if (b.action === 'remove') { if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' }); await sql`DELETE FROM mb_players WHERE id = ${id}`; return res.status(200).json({ ok: true }); }
    if (b.action === 'clear') { await sql`DELETE FROM mb_players`; return res.status(200).json({ ok: true }); }
    return res.status(400).json({ error: 'action' });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'server' }); }
}
