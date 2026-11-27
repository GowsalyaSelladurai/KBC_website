import { Pool, PoolClient } from "pg";
const g = globalThis as any;
export const pool: Pool = g.__pool ?? (g.__pool = new Pool({ connectionString: process.env.DATABASE_URL }));
export const q = async (text: string, params: any[] = []) => (await pool.query(text, params)).rows as any[];
export async function tx<T>(fn: (c: PoolClient) => Promise<T>) {
  const c = await pool.connect();
  try { await c.query("begin"); const r = await fn(c); await c.query("commit"); return r; }
  catch (e) { await c.query("rollback"); throw e; } finally { c.release(); }
}

// Anything with .query() — the shared pool or a transaction client.
export type Db = { query(text: string, params?: any[]): Promise<{ rows: any[] }> };
