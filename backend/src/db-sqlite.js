import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath =
  process.env.SQLITE_PATH ||
  path.join(__dirname, '..', 'data', 'class_tracker.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function adaptSqlForSqlite(sql) {
  return sql
    .replace(/\bNOW\s*\(\s*\)/gi, "datetime('now')")
    .replace(/\s+FOR\s+UPDATE\b/gi, '');
}

function runQuery(sql, params = []) {
  const adapted = adaptSqlForSqlite(sql);
  const trimmed = adapted.trim().toUpperCase();
  if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
    return [db.prepare(adapted).all(...params)];
  }
  const info = db.prepare(adapted).run(...params);
  return [{ insertId: Number(info.lastInsertRowid), affectedRows: info.changes }];
}

class SqliteConnection {
  constructor(database) {
    this.db = database;
    this.inTransaction = false;
  }

  async query(sql, params = []) {
    return runQuery(sql, params);
  }

  async beginTransaction() {
    this.db.exec('BEGIN IMMEDIATE');
    this.inTransaction = true;
  }

  async commit() {
    this.db.exec('COMMIT');
    this.inTransaction = false;
  }

  async rollback() {
    this.db.exec('ROLLBACK');
    this.inTransaction = false;
  }

  release() {}
}

export const pool = {
  query: async (sql, params) => runQuery(sql, params),
  getConnection: async () => new SqliteConnection(db),
};

export function initSqliteDatabase() {
  const schemaPath = path.join(__dirname, 'schema-sqlite.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log(`SQLite database ready at ${dbPath}`);
}
