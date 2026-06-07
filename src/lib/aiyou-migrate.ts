/**
 * AIYOU 数据库迁移脚本
 * 使用 better-sqlite3 直接执行 SQL
 */
import { getDB } from './aiyou-db';

export function migrateAIYOU(): void {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '未命名项目',
      settings TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT DEFAULT '',
      x REAL DEFAULT 0,
      y REAL DEFAULT 0,
      width REAL DEFAULT 420,
      height REAL DEFAULT 360,
      status TEXT DEFAULT 'IDLE',
      data TEXT DEFAULT '{}',
      inputs TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_nodes_project_id ON nodes(project_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      from_node TEXT REFERENCES nodes(id) ON DELETE CASCADE,
      to_node TEXT REFERENCES nodes(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_connections_project_id ON connections(project_id);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS media_files (
      id TEXT PRIMARY KEY,
      node_id TEXT REFERENCES nodes(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      storage_type TEXT DEFAULT 'local',
      file_path TEXT,
      url TEXT,
      mime_type TEXT,
      file_size INTEGER DEFAULT 0,
      width INTEGER,
      height INTEGER,
      duration REAL,
      metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_media_node_id ON media_files(node_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_media_type ON media_files(type);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS groups_table (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT DEFAULT '',
      x REAL DEFAULT 0,
      y REAL DEFAULT 0,
      width REAL DEFAULT 600,
      height REAL DEFAULT 400,
      color TEXT DEFAULT '#3b82f6',
      node_ids TEXT DEFAULT '[]',
      data TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_groups_project_id ON groups_table(project_id);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      node_id TEXT REFERENCES nodes(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      role_type TEXT DEFAULT 'supporting',
      profile_data TEXT DEFAULT '{}',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_characters_project_id ON characters(project_id);`);
}
