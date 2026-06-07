import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/aiyou-db';
import { migrateAIYOU } from '@/lib/aiyou-migrate';
import { v4 as uuidv4 } from 'uuid';

let migrated = false;
function ensureMigrated() {
  if (!migrated) { migrateAIYOU(); migrated = true; }
}

// POST /api/aiyou/connections
export async function POST(req: NextRequest) {
  try {
    ensureMigrated();
    const db = getDB();
    const body = await req.json();
    const id = body.id || uuidv4();
    db.prepare(
      'INSERT INTO connections (id, project_id, from_node, to_node) VALUES (?, ?, ?, ?)'
    ).run(id, body.project_id, body.from_node, body.to_node);
    const conn = db.prepare('SELECT * FROM connections WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: conn });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
