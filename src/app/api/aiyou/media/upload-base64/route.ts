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

// POST /api/aiyou/media/upload-base64
export async function POST(req: NextRequest) {
  try {
    ensureMigrated();
    const db = getDB();
    const body = await req.json();
    const { data, node_id, project_id, type, metadata } = body;
    if (!data) return NextResponse.json({ success: false, error: '缺少 data 字段' }, { status: 400 });

    let buffer: Buffer, mimeType: string;
    if (data.startsWith('data:')) {
      const matches = data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return NextResponse.json({ success: false, error: '无效的 base64 data URI' }, { status: 400 });
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      mimeType = type === 'video' ? 'video/mp4' : type === 'audio' ? 'audio/mp3' : 'image/png';
      buffer = Buffer.from(data, 'base64');
    }

    const mediaType = getMediaType(mimeType);
    const ext = getExtFromMime(mimeType);
    const fileId = uuidv4();

    let relativePath: string;
    if (project_id) {
      const nodePrefix = node_id ? `${node_id}-` : '';
      const timestamp = Date.now();
      const typeFolder = `${mediaType}s`;
      relativePath = `${project_id}/${typeFolder}/${nodePrefix}${timestamp}-${fileId.slice(0, 8)}.${ext}`;
    } else {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      relativePath = `${mediaType}/${date}/${fileId}.${ext}`;
    }
    const absolutePath = path.join(UPLOADS_DIR, relativePath);

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, buffer);

    const fullUrl = `/api/aiyou/media/files/${relativePath}`;

    db.prepare(
      'INSERT INTO media_files (id, node_id, type, storage_type, file_path, url, mime_type, file_size, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(fileId, node_id || null, mediaType, 'local', relativePath, fullUrl, mimeType, buffer.length, JSON.stringify(metadata || {}));

    return NextResponse.json({
      success: true,
      data: { id: fileId, url: fullUrl, type: mediaType, size: buffer.length },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
