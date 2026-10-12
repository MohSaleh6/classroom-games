import { neon } from '@neondatabase/serverless';
// Files starting with _ are not turned into API routes by Vercel.

export const sql = neon(process.env.DATABASE_URL);

// Mystery Box keeps one row per student. The table is created on first use.
let ready = null;
export function ensureTable() {
  ready = ready || sql`CREATE TABLE IF NOT EXISTS mb_players (
    id serial PRIMARY KEY,
    name text NOT NULL,
    name_key text NOT NULL UNIQUE,
    boxes smallint NOT NULL DEFAULT 0 CHECK (boxes BETWEEN 0 AND 63),
    colour smallint NOT NULL DEFAULT 0 CHECK (colour BETWEEN 0 AND 5),
    support boolean NOT NULL DEFAULT false,
    plan_b boolean NOT NULL DEFAULT false,
    confirmed boolean NOT NULL DEFAULT false,
    time_up boolean NOT NULL DEFAULT false,
    token text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`.catch(e => { ready = null; throw e; });
  return ready;
}

export const readBody = b => (typeof b === 'string' ? JSON.parse(b || '{}') : (b || {}));
