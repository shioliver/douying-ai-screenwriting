import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/aiyou-db';
import { migrateAIYOU } from '@/lib/aiyou-migrate';
import { v4 as uuidv4 } from 'uuid';

let migrated = false;
function ensureMigrated() {
  if (!migrated) { migrateAIYOU(); migrated = true; }
}

// POST /api/aiyou/nodes
export async function POST(req: NextRequest) {
  try {
    ensureMigrated();
    const db = getDB();
    const body = await req.json();
    const id = body.id || uuidv4();
    db.prepare(
      'INSERT INTO nodes (id, project_id, type, title, x, y, width, height, status, data, inputs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, body.project_id, body.type, body.title || '', body.x || 0, body.y || 0, body.width || 420, body.height || 360, 'IDLE', JSON.stringify(body.data || {}), JSON.stringify(body.inputs || []));
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: node });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/aiyou/nodes/batch - 批量更新节点
export async function PUT(req: NextRequest) {
  try {
    ensureMigrated();
    const db = getDB();
    const body = await req.json();
    const { nodes } = body;
    if (!Array.isArray(nodes)) return NextResponse.json({ success: false, error: '需要 nodes 数组' }, { status: 400 });

    db.exec('BEGIN TRANSACTION');
    try {
      const updateNode = db.prepare(
        'UPDATE nodes SET x = ?, y = ?, width = ?, height = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      );
      for (const node of nodes) {
        updateNode.run(node.x || 0, node.y || 0, node.width || 420, node.height || 360, node.id);
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
