import { neon } from '@neondatabase/serverless';
// Files starting with _ are not turned into API routes by Vercel.

export const sql = neon(process.env.DATABASE_URL);
export const MAX_POINTS = 2500, MAX_SECONDS = 660;

// Press Start keeps one row per player. The table is created on first use.
let ready = null;
export function ensureTable() {
  ready = ready || sql`CREATE TABLE IF NOT EXISTS ps_scores (
    id serial PRIMARY KEY,
    name text NOT NULL,
    name_key text NOT NULL UNIQUE,
    points integer NOT NULL DEFAULT 0 CHECK (points BETWEEN 0 AND 2500),
    seconds integer NOT NULL DEFAULT 660 CHECK (seconds BETWEEN 0 AND 660),
    approved smallint NOT NULL DEFAULT 0 CHECK (approved BETWEEN 0 AND 11),
    finished boolean NOT NULL DEFAULT false,
    token text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`.catch(e => { ready = null; throw e; });
  return ready;
}

export const readBody = b => (typeof b === 'string' ? JSON.parse(b || '{}') : (b || {}));
