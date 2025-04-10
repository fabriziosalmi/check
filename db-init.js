import * as SQL from 'sql.js';
import { saveToStorage, loadFromStorage, clearStorage } from './storage.js';

const initSqlJs = SQL.default;

let db;

const getDb = () => {
  if (!db) {
    console.error('[DEBUG] Database access attempted before initialization');
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  console.log('[DEBUG] Database instance accessed');
  return db;
};

const initDatabase = async () => {
  console.log('[DEBUG] Initializing database...');
  
  try {
    const SQL = await initSqlJs({ 
      locateFile: file => `/${file}`
    });
    
    // Try to load existing database from localStorage
    const storedDb = await loadFromStorage(initSqlJs);
    
    if (storedDb) {
      console.log('[DEBUG] Successfully loaded database from localStorage');
      db = storedDb;
    } else {
      console.log('[DEBUG] Creating new database');
      // Create new database if not in localStorage
      db = new SQL.Database();
      
      // Create tables
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        score INTEGER DEFAULT 0,
        daily_sent INTEGER DEFAULT 0,
        last_sent_date TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS checks (
        id TEXT PRIMARY KEY,
        sender TEXT,
        receiver TEXT,
        message TEXT,
        sent_at INTEGER,
        snoozed_at INTEGER,
        expired INTEGER DEFAULT 0,
        FOREIGN KEY(sender) REFERENCES users(id),
        FOREIGN KEY(receiver) REFERENCES users(id)
      )`);

      // Initialize users if they don't exist
      const today = new Date().toISOString().split('T')[0];
      db.run(`INSERT OR IGNORE INTO users (id, score, daily_sent, last_sent_date) VALUES ('fab', 0, 0, ?)`, [today]);
      db.run(`INSERT OR IGNORE INTO users (id, score, daily_sent, last_sent_date) VALUES ('dome', 0, 0, ?)`, [today]);
      
      // Save the new database to localStorage
      saveToStorage(db);
      console.log('[DEBUG] Created and saved new database to localStorage');
    }

    // Tables are created during initialization when a new database is created
  
    return db;
  } finally {
  };
};

const resetDatabase = async () => {
  console.log('[DEBUG] Resetting database...');
  clearStorage();
  console.log('[DEBUG] Successfully cleared database from localStorage');
  await initDatabase();
  console.log('[DEBUG] Database reset complete');
};

export {
  initDatabase,
  getDb,
  resetDatabase
};
