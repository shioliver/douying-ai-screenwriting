import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/aiyou-db';
import { migrateAIYOU } from '@/lib/aiyou-migrate';

let migrated = false;
function ensureMigrated() {
  if (!migrated) { migrateAIYOU(); migrated = true; }
}

// PUT /api/aiyou/nodes/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureMigrated();
    const db = getDB();
    const { id } = await params;
    const body = await req.json();
    const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [];
    const allowed = ['type', 'title', 'x', 'y', 'width', 'height', 'status'];
    for (const key of allowed) {
      if (body[key] !== undefined) { updates.push(`${key} = ?`); values.push(body[key]); }
    }
    if (body.data !== undefined) { updates.push('data = ?'); values.push(JSON.stringify(body.data)); }
    if (body.inputs !== undefined) { updates.push('inputs = ?'); values.push(JSON.stringify(body.inputs)); }
    values.push(id);
    const result = db.prepare(`UPDATE nodes SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    if (result.changes === 0) return NextResponse.json({ success: false, error: '节点不存在' }, { status: 404 });
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: node });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/aiyou/nodes/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureMigrated();
    const db = getDB();
    const { id } = await params;
    const result = db.prepare('DELETE FROM nodes WHERE id = ?').run(id);
    if (result.changes === 0) return NextResponse.json({ success: false, error: '节点不存在' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
