import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/aiyou-db';
import { migrateAIYOU } from '@/lib/aiyou-migrate';
import { v4 as uuidv4 } from 'uuid';

let migrated = false;
function ensureMigrated() {
  if (!migrated) { migrateAIYOU(); migrated = true; }
}

// GET /api/aiyou/projects/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureMigrated();
    const db = getDB();
    const { id } = await params;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) return NextResponse.json({ success: false, error: '项目不存在' }, { status: 404 });

    const nodes = db.prepare('SELECT * FROM nodes WHERE project_id = ?').all(id);
    const connections = db.prepare('SELECT * FROM connections WHERE project_id = ?').all(id);
    const groups = db.prepare('SELECT * FROM groups_table WHERE project_id = ?').all(id);

    // Attach media to nodes
    const nodeIds = nodes.map((n: any) => n.id);
    let mediaFiles: any[] = [];
    if (nodeIds.length > 0) {
      const placeholders = nodeIds.map(() => '?').join(',');
      mediaFiles = db.prepare(`SELECT * FROM media_files WHERE node_id IN (${placeholders})`).all(...nodeIds);
    }
    const mediaByNode: Record<string, any[]> = {};
    for (const mf of mediaFiles) {
      if (!mediaByNode[mf.node_id]) mediaByNode[mf.node_id] = [];
      mediaByNode[mf.node_id].push(mf);
    }
    const nodesWithMedia = nodes.map((n: any) => ({ ...n, media: mediaByNode[n.id] || [] }));

    return NextResponse.json({
      success: true,
      data: { ...project, nodes: nodesWithMedia, connections, groups },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/aiyou/projects/[id]
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
    if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title); }
    if (body.settings !== undefined) { updates.push('settings = ?'); values.push(JSON.stringify(body.settings)); }
    values.push(id);
    const result = db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    if (result.changes === 0) return NextResponse.json({ success: false, error: '项目不存在' }, { status: 404 });
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/aiyou/projects/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureMigrated();
    const db = getDB();
    const { id } = await params;
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    if (result.changes === 0) return NextResponse.json({ success: false, error: '项目不存在' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
