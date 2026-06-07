import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/aiyou-db';
import { migrateAIYOU } from '@/lib/aiyou-migrate';
import fs from 'fs';
import path from 'path';

let migrated = false;
function ensureMigrated() {
  if (!migrated) { migrateAIYOU(); migrated = true; }
}

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'aiyou', 'uploads');

// DELETE /api/aiyou/media/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureMigrated();
    const db = getDB();
    const { id } = await params;
    const file = db.prepare('SELECT * FROM media_files WHERE id = ?').get(id);
    if (!file) return NextResponse.json({ success: false, error: '文件不存在' }, { status: 404 });

    if ((file as any).storage_type === 'local' && (file as any).file_path) {
      const absolutePath = path.join(UPLOADS_DIR, (file as any).file_path);
      if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    }

    db.prepare('DELETE FROM media_files WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
