import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/aiyou-db';
import { migrateAIYOU } from '@/lib/aiyou-migrate';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

let migrated = false;
function ensureMigrated() {
  if (!migrated) { migrateAIYOU(); migrated = true; }
}

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'aiyou', 'uploads');

function getMediaType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'other';
}

function getExtFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp',
    'video/mp4': 'mp4', 'video/webm': 'webm',
    'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/mp3': 'mp3',
  };
  return map[mimeType] || 'bin';
}

// POST /api/aiyou/media/upload
export async function POST(req: NextRequest) {
  try {
    ensureMigrated();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ success: false, error: '没有上传文件' }, { status: 400 });

    const db = getDB();
    const nodeId = formData.get('node_id') as string | null;
    const metadata = formData.get('metadata') as string | null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    const size = file.size;
    const mediaType = getMediaType(mimeType);
    const ext = getExtFromMime(mimeType);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileId = uuidv4();
    const relativePath = `${mediaType}/${date}/${fileId}.${ext}`;
    const absolutePath = path.join(UPLOADS_DIR, relativePath);

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, buffer);

    const metaObj = metadata ? JSON.parse(metadata) : {};
    db.prepare(
      'INSERT INTO media_files (id, node_id, type, storage_type, file_path, url, mime_type, file_size, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(fileId, nodeId, mediaType, 'local', relativePath, `/api/aiyou/media/files/${relativePath}`, mimeType, size, JSON.stringify(metaObj));

    return NextResponse.json({
      success: true,
      data: { id: fileId, url: `/api/aiyou/media/files/${relativePath}`, type: mediaType, size, mime_type: mimeType },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
