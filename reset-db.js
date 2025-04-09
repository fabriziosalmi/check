// reset-db.js - Database Reset Utility for Check App

// This script resets the database by clearing all checks and resetting user scores
// It can be run from the browser console by calling resetDatabase()

/**
 * Resets the database by dropping and recreating tables, then reinitializing with fresh data
 */
function resetDatabase() {
    console.log("🔄 Starting database reset...");
    
    try {
        // Check if SQL.js and database are initialized
        if (!window.SQL || !window.appState || !window.appState.sqlDb) {
            throw new Error("SQL.js or database not initialized. Please load the app first.");
        }
        
        const db = window.appState.sqlDb;
        
        // Begin transaction for atomicity
        db.exec('BEGIN TRANSACTION');
        
        // Drop existing tables
        console.log("Dropping existing tables...");
        db.exec(`
            DROP TABLE IF EXISTS checks;
            DROP TABLE IF EXISTS users;
        `);
        
        // Recreate tables with fresh schema
        console.log("Recreating tables with fresh schema...");
        db.exec(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                score INTEGER DEFAULT 0,
                checks_sent INTEGER DEFAULT 0,
                last_reset_date TEXT DEFAULT CURRENT_DATE
            );

            CREATE TABLE checks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                sent_time INTEGER NOT NULL,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'snoozed', 'expired')),
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            );
        `);
        
        // Insert default users
        console.log("Inserting default users...");
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        db.run("INSERT INTO users (id, name, score, checks_sent, last_reset_date) VALUES (?, ?, ?, ?, ?)", 
               [1, 'Fab', 0, 0, today]);
        db.run("INSERT INTO users (id, name, score, checks_sent, last_reset_date) VALUES (?, ?, ?, ?, ?)", 
               [2, 'Dome', 0, 0, today]);
        
        // Insert some sample checks for testing (optional)
        console.log("Inserting sample checks...");
        const now = Date.now();
        // A check from Fab to Dome
        db.run(
            'INSERT INTO checks (sender_id, receiver_id, message, sent_time, status) VALUES (?, ?, ?, ?, ?)',
            [1, 2, 'Hey Dome, please check this out!', now, 'pending']
        );
        // A check from Dome to Fab
        db.run(
            'INSERT INTO checks (sender_id, receiver_id, message, sent_time, status) VALUES (?, ?, ?, ?, ?)',
            [2, 1, 'Fab, I need your feedback on this.', now, 'pending']
        );
        
        // Commit all changes
        db.exec('COMMIT');
        console.log("✅ Database reset completed successfully!");
        
        // Update UI to reflect changes
        if (window.updateUI && typeof window.updateUI === 'function') {
            window.updateUI();
        }
        
        // Reload checks for current user
        if (window.loadChecks && typeof window.loadChecks === 'function') {
            window.loadChecks();
        }
        
        if (window.loadOutgoingChecks && typeof window.loadOutgoingChecks === 'function') {
            window.loadOutgoingChecks();
        }
        
        return true;
    } catch (error) {
        console.error("❌ Error resetting database:", error);
        // Try to rollback if possible
        try {
            if (window.appState && window.appState.sqlDb) {
                window.appState.sqlDb.exec('ROLLBACK');
            }
        } catch (rollbackError) {
            console.error("Failed to rollback transaction:", rollbackError);
        }
        alert(`Database reset failed: ${error.message}`);
        return false;
    }
}

/**
 * Adds a button to the UI for easy database reset
 */
function addResetButton() {
    // Check if button already exists
    if (document.getElementById('reset-db-btn')) {
        return;
    }
    
    // Create button
    const resetBtn = document.createElement('button');
    resetBtn.id = 'reset-db-btn';
    resetBtn.className = 'px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 fixed bottom-4 right-4';
    resetBtn.innerHTML = '<i class="fas fa-database mr-2"></i>Reset Database';
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the database? This will clear all checks and scores.')) {
            resetDatabase();
        }
    });
    
    // Add to document
    document.body.appendChild(resetBtn);
    console.log("Reset database button added to UI");
}

// Add the reset button when the script loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure the main app has initialized
    setTimeout(addResetButton, 1000);
    console.log("Reset DB script loaded. Use resetDatabase() to manually reset the database.");
});

// Make resetDatabase available globally
window.resetDatabase = resetDatabase;