import { NextResponse } from 'next/server';
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  try {
    const D1_DATABASE = getCloudflareContext().env.D1_DATABASE;
    const { results } = await D1_DATABASE.prepare('SELECT * FROM Users').all();
    return NextResponse.json({ users: results }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Failed to fetch users: ${error}` }, { status: 500 });
  }
}