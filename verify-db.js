import * as db from './db-init.js';

db.initDatabase()
  .then(() => {
    const dbInstance = db.getDb();
    
    // Check tables exist
    const tables = dbInstance.exec('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('Tables:', tables[0].values);
    
    // Verify users table schema
    const usersSchema = dbInstance.exec('PRAGMA table_info(users)');
    console.log('Users schema:', usersSchema[0].values);
    
    // Verify checks table schema
    const checksSchema = dbInstance.exec('PRAGMA table_info(checks)');
    console.log('Checks schema:', checksSchema[0].values);
    
    // Verify foreign key constraints
    const fkCheck = dbInstance.exec('PRAGMA foreign_key_check');
    console.log('Foreign key check:', fkCheck.length ? fkCheck : 'OK');
    
    // Verify initial users were created
    const users = dbInstance.exec('SELECT * FROM users');
    console.log('Users:', users[0].values);
  })
  .catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
  });