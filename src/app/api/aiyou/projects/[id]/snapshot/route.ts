import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/aiyou-db';
import { migrateAIYOU } from '@/lib/aiyou-migrate';
import { v4 as uuidv4 } from 'uuid';

let migrated = false;
function ensureMigrated() {
  if (!migrated) {
    migrateAIYOU();
    migrated = true;
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureMigrated();
    const db = getDB();
    const { id } = await params;
    const body = await req.json();
    const { nodes, connections, groups } = body;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) return NextResponse.json({ success: false, error: '项目不存在' }, { status: 404 });

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare('DELETE FROM connections WHERE project_id = ?').run(id);
      db.prepare('DELETE FROM nodes WHERE project_id = ?').run(id);
      db.prepare('DELETE FROM groups_table WHERE project_id = ?').run(id);

      if (Array.isArray(nodes) && nodes.length > 0) {
        const insertNode = db.prepare(
          'INSERT INTO nodes (id, project_id, type, title, x, y, width, height, status, data, inputs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        for (const n of nodes) {
          insertNode.run(n.id, id, n.type, n.title || '', n.x || 0, n.y || 0, n.width || 420, n.height || 360, n.status || 'IDLE', JSON.stringify(n.data || {}), JSON.stringify(n.inputs || []));
        }
      }

      if (Array.isArray(connections) && connections.length > 0) {
        const insertConn = db.prepare(
          'INSERT INTO connections (id, project_id, from_node, to_node) VALUES (?, ?, ?, ?)'
        );
        for (const c of connections) {
          insertConn.run(c.id || uuidv4(), id, c.from, c.to);
        }
      }

      if (Array.isArray(groups) && groups.length > 0) {
        const insertGroup = db.prepare(
          'INSERT INTO groups_table (id, project_id, title, x, y, width, height, color, node_ids, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        for (const g of groups) {
          insertGroup.run(g.id || uuidv4(), id, g.title || '', g.x || 0, g.y || 0, g.width || 600, g.height || 400, g.color || '#3b82f6', JSON.stringify(g.nodeIds || []), JSON.stringify(g.data || {}));
        }
      }

      db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
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
