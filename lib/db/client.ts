import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let _db: NeonHttpDatabase<typeof schema> | null = null;

function getDatabase(): NeonHttpDatabase<typeof schema> {
  if (_db) return _db;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  _db = drizzle(sql, { schema });
  return _db;
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get: (_, prop) => {
    return getDatabase()[prop as keyof NeonHttpDatabase<typeof schema>];
  },
});
