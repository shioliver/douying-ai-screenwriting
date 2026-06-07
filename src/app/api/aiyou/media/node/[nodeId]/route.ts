import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/aiyou-db';
import { migrateAIYOU } from '@/lib/aiyou-migrate';

let migrated = false;
function ensureMigrated() {
  if (!migrated) { migrateAIYOU(); migrated = true; }
}

// GET /api/aiyou/media/node/[nodeId]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    ensureMigrated();
    const db = getDB();
    const { nodeId } = await params;
    const files = db.prepare('SELECT * FROM media_files WHERE node_id = ? ORDER BY created_at DESC').all(nodeId);
    return NextResponse.json({ success: true, data: files });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
