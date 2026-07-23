import dotenv from 'dotenv';

dotenv.config();

const driver = process.env.DB_DRIVER || 'sqlite';

let pool;
let initDatabase;

if (driver === 'mysql') {
  const mysqlModule = await import('./db-mysql.js');
  pool = mysqlModule.pool;
  initDatabase = mysqlModule.initDatabase;
} else {
  const sqliteModule = await import('./db-sqlite.js');
  pool = sqliteModule.pool;
  initDatabase = sqliteModule.initSqliteDatabase;
}

export { pool, initDatabase };
