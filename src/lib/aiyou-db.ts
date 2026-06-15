/**
 * AIYOU 数据库连接 - SQLite via better-sqlite3
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

function getDbPath(): string {
  const dataDir = path.join(process.cwd(), 'data', 'aiyou');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'aiyou.db');
}

function removeInvalidSidecarFiles(dbPath: string): void {
  const walPath = `${dbPath}-wal`;
  const shmPath = `${dbPath}-shm`;
  const walExists = fs.existsSync(walPath);
  const shmExists = fs.existsSync(shmPath);
  const walSize = walExists ? fs.statSync(walPath).size : 0;
  const shmSize = shmExists ? fs.statSync(shmPath).size : 0;
  const invalid = (walExists && walSize === 0) || (shmExists && shmSize === 0) || (walExists !== shmExists);

  if (invalid) {
    for (const filePath of [walPath, shmPath]) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}

export function getDB(): Database.Database {
  if (!db) {
    const dbPath = getDbPath();
    removeInvalidSidecarFiles(dbPath);
    const nextDb = new Database(dbPath);
    try {
      nextDb.pragma('journal_mode = DELETE');
      nextDb.pragma('busy_timeout = 5000');
      nextDb.pragma('foreign_keys = ON');
      db = nextDb;
    } catch (error) {
      nextDb.close();
      db = null;
      throw error;
    }
  }
  return db;
}

export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
  }
}
