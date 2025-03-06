import { getCloudflareContext } from "@opennextjs/cloudflare";

function getDatabase() {
  const D1_DATABASE: D1Database = getCloudflareContext().env.D1_DATABASE;
  return D1_DATABASE;
}  

export async function get(query: string, params: unknown[] = []) {
  const db = getDatabase();
  const result = await db.prepare(query).bind(...params).first();
  return result;
}

export async function all(query: string, params: unknown[] = []) {
  const db = getDatabase();
  const result = await db.prepare(query).bind(...params).all();
  return result.results;
}

export async function run(query: string, params: unknown[] = []) {
  const db = getDatabase();
  await db.prepare(query).bind(...params).run();
  const result = await db.prepare('SELECT last_insert_rowid() as id').first();
  return result;
}