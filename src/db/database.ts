import * as SQLite from 'expo-sqlite';
import { DDL } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('tallycheckin.db');
  }
  return db;
}

// 确保表结构存在（幂等，可多次调用）
export function ensureSchema(): void {
  const database = getDatabase();
  for (const sql of DDL) {
    database.execSync(sql);
  }
}
