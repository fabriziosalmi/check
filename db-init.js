import initSqlJs from 'sql.js';
const wasmUrl = new URL('sql.js/dist/sql-wasm.wasm', import.meta.url).href;

let db;

export const initDatabase = async () => {
  try {
    const SQL = await initSqlJs({
      locateFile: () => 'sql-wasm.wasm'
    });
    db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      daily_sent INTEGER DEFAULT 0,
      last_sent_date TEXT
    );

    INSERT OR IGNORE INTO users (id, name) VALUES
      ('fab', 'Fab'),
      ('dome', 'Dome');

    CREATE TABLE IF NOT EXISTS checks (
      id TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      receiver TEXT NOT NULL,
      message TEXT,
      sent_at INTEGER NOT NULL,
      snoozed_at INTEGER,
      expired INTEGER DEFAULT 0,
      FOREIGN KEY(sender) REFERENCES users(id),
      FOREIGN KEY(receiver) REFERENCES users(id)
    );
  `);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getDb = () => db;
