import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/aiyou-db';
import { migrateAIYOU } from '@/lib/aiyou-migrate';
import { v4 as uuidv4 } from 'uuid';

// 确保数据库已迁移
let migrated = false;
function ensureMigrated() {
  if (!migrated) {
    migrateAIYOU();
    migrated = true;
  }
}

// GET /api/aiyou/projects
export async function GET() {
  try {
    ensureMigrated();
    const db = getDB();
    const projects = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all();
    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/aiyou/projects
export async function POST(req: NextRequest) {
  try {
    ensureMigrated();
    const db = getDB();
    const body = await req.json();
    const id = uuidv4();
    const title = body.title || '未命名项目';
    const settings = JSON.stringify(body.settings || {});
    db.prepare('INSERT INTO projects (id, title, settings) VALUES (?, ?, ?)').run(id, title, settings);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
