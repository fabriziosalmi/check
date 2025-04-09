// Initialize database
let db;
const initDB = async () => {
    // Load SQL.js library
    const sqlPromise = initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    
    // Create a new database
    db = await sqlPromise;
    const sqlDb = new db.Database();
    
    // Create tables if they don't exist
    sqlDb.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            checks_sent INTEGER DEFAULT 0,
            last_reset_date TEXT DEFAULT CURRENT_DATE
        );
    `);
    
    sqlDb.run(`
        CREATE TABLE IF NOT EXISTS checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            sent_time INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        );
    `);
    
    // Check if users exist, if not create them
    const users = sqlDb.exec("SELECT * FROM users");
    if (!users.length || users[0].values.length < 2) {
        sqlDb.run("DELETE FROM users"); // Clear any partial data
        sqlDb.run("INSERT INTO users (id, name, score, checks_sent) VALUES (1, 'User 1', 0, 0)");
        sqlDb.run("INSERT INTO users (id, name, score, checks_sent) VALUES (2, 'User 2', 0, 0)");
    }
    
    return sqlDb;
};

// App state
let currentUser = 1; // Default to User 1
let sqlDb;
let checksRemaining = 3;

// DOM elements
const user1Btn = document.getElementById('user1-btn');
const user2Btn = document.getElementById('user2-btn');
const currentUserSpan = document.getElementById('current-user');
const checksRemainingSpan = document.getElementById('checks-remaining');
const checkMessageInput = document.getElementById('check-message');
const sendCheckBtn = document.getElementById('send-check');
const user1ScoreSpan = document.getElementById('user1-score');
const user2ScoreSpan = document.getElementById('user2-score');
const checksContainer = document.getElementById('checks-container');
const noChecksMessage = document.getElementById('no-checks-message');

// Initialize the app
window.addEventListener('DOMContentLoaded', async () => {
    // Load SQL.js
    const sqlPromise = initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    
    const SQL = await sqlPromise;
    
    // Create a database
    sqlDb = new SQL.Database();
    
    // Create tables
    sqlDb.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            checks_sent INTEGER DEFAULT 0,
            last_reset_date TEXT DEFAULT CURRENT_DATE
        );
    `);
    
    sqlDb.run(`
        CREATE TABLE IF NOT EXISTS checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            sent_time INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        );
    `);
    
    // Initialize users if they don't exist
    const result = sqlDb.exec("SELECT COUNT(*) FROM users");
    if (result[0].values[0][0] === 0) {
        sqlDb.run("INSERT INTO users (id, name, score) VALUES (1, 'User 1', 0)");
        sqlDb.run("INSERT INTO users (id, name, score) VALUES (2, 'User 2', 0)");
    }
    
    // Reset daily checks if needed
    resetDailyChecksIfNeeded();
    
    // Update UI
    updateUI();
    loadChecks();
});

// Event listeners
user1Btn.addEventListener('click', () => switchUser(1));
user2Btn.addEventListener('click', () => switchUser(2));
sendCheckBtn.addEventListener('click', sendCheck);

// Switch between users
function switchUser(userId) {
    currentUser = userId;
    
    // Update UI
    if (userId === 1) {
        user1Btn.classList.add('bg-indigo-600', 'text-white');
        user1Btn.classList.remove('bg-gray-300', 'text-gray-700');
        user2Btn.classList.add('bg-gray-300', 'text-gray-700');
        user2Btn.classList.remove('bg-indigo-600', 'text-white');
    } else {
        user2Btn.classList.add('bg-indigo-600', 'text-white');
        user2Btn.classList.remove('bg-gray-300', 'text-gray-700');
        user1Btn.classList.add('bg-gray-300', 'text-gray-700');
        user1Btn.classList.remove('bg-indigo-600', 'text-white');
    }
    
    currentUserSpan.textContent = `User ${userId}`;
    
    // Update checks remaining
    updateChecksRemaining();
    
    // Reload checks for the current user
    loadChecks();
}

// Send a check to the other user
function sendCheck() {
    const message = checkMessageInput.value.trim();
    if (!message) {
        alert('Please enter a check message');
        return;
    }
    
    if (checksRemaining <= 0) {
        alert('You have no checks remaining today');
        return;
    }
    
    // Determine receiver
    const receiverId = currentUser === 1 ? 2 : 1;
    
    // Insert check into database
    const currentTime = Date.now();
    sqlDb.run(
        'INSERT INTO checks (sender_id, receiver_id, message, sent_time, status) VALUES (?, ?, ?, ?, ?)',
        [currentUser, receiverId, message, currentTime, 'pending']
    );
    
    // Update checks sent count
    sqlDb.run(
        'UPDATE users SET checks_sent = checks_sent + 1 WHERE id = ?',
        [currentUser]
    );
    
    // Clear input
    checkMessageInput.value = '';
    
    // Update UI
    updateChecksRemaining();
    alert('Check sent successfully!');
}

// Load checks for the current user
function loadChecks() {
    // Get checks sent to current user
    const result = sqlDb.exec(`
        SELECT c.id, c.sender_id, c.message, c.sent_time, c.status, u.name as sender_name
        FROM checks c
        JOIN users u ON c.sender_id = u.id
        WHERE c.receiver_id = ${currentUser} AND c.status = 'pending'
        ORDER BY c.sent_time DESC
    `);
    
    // Clear checks container
    while (checksContainer.firstChild) {
        if (checksContainer.firstChild !== noChecksMessage) {
            checksContainer.removeChild(checksContainer.firstChild);
        }
    }
    
    // Show or hide no checks message
    if (!result.length || result[0].values.length === 0) {
        noChecksMessage.style.display = 'block';
        return;
    }
    
    noChecksMessage.style.display = 'none';
    
    // Add checks to container
    const columns = result[0].columns;
    const checks = result[0].values;
    
    checks.forEach(check => {
        const checkId = check[0];
        const senderId = check[1];
        const message = check[2];
        const sentTime = check[3];
        const status = check[4];
        const senderName = check[5];
        
        // Calculate time remaining
        const currentTime = Date.now();
        const elapsedTime = currentTime - sentTime;
        const timeRemaining = Math.max(0, 30 * 60 * 1000 - elapsedTime); // 30 minutes in milliseconds
        
        // Create check element
        const checkElement = document.createElement('div');
        checkElement.className = 'bg-indigo-50 rounded-lg p-4 border border-indigo-200';
        
        // Format time remaining
        const minutesRemaining = Math.floor(timeRemaining / (60 * 1000));
        const secondsRemaining = Math.floor((timeRemaining % (60 * 1000)) / 1000);
        
        checkElement.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <p class="font-semibold text-indigo-800">${senderName}</p>
                    <p class="text-sm text-gray-500">Time remaining: <span class="check-timer" data-sent="${sentTime}" data-id="${checkId}">${minutesRemaining}m ${secondsRemaining}s</span></p>
                </div>
                <div class="flex space-x-2">
                    <button class="snooze-btn px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition" data-id="${checkId}">Snooze</button>
                </div>
            </div>
            <p class="text-gray-700">${message}</p>
        `;
        
        checksContainer.appendChild(checkElement);
        
        // Add event listener to snooze button
        const snoozeBtn = checkElement.querySelector('.snooze-btn');
        snoozeBtn.addEventListener('click', () => snoozeCheck(checkId, senderId));
        
        // Start timer
        startCheckTimer(checkElement.querySelector('.check-timer'), checkId, senderId);
    });
}

// Start timer for a check
function startCheckTimer(timerElement, checkId, senderId) {
    const sentTime = parseInt(timerElement.getAttribute('data-sent'));
    
    const timerInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - sentTime;
        const timeRemaining = Math.max(0, 30 * 60 * 1000 - elapsedTime); // 30 minutes in milliseconds
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = 'Expired';
            
            // Check expired, sender gets a point
            awardPoints(senderId, 1);
            
            // Update check status
            sqlDb.run(
                'UPDATE checks SET status = "expired" WHERE id = ?',
                [checkId]
            );
            
            // Reload checks
            loadChecks();
            updateUI();
            
            return;
        }
        
        // Format time remaining
        const minutesRemaining = Math.floor(timeRemaining / (60 * 1000));
        const secondsRemaining = Math.floor((timeRemaining % (60 * 1000)) / 1000);
        timerElement.textContent = `${minutesRemaining}m ${secondsRemaining}s`;
    }, 1000);
}

// Snooze a check
function snoozeCheck(checkId, senderId) {
    // Update check status
    sqlDb.run(
        'UPDATE checks SET status = "snoozed" WHERE id = ?',
        [checkId]
    );
    
    // Award points: 1 to sender, 2 to current user (receiver)
    awardPoints(senderId, 1);
    awardPoints(currentUser, 2);
    
    // Update UI
    loadChecks();
    updateUI();
    
    alert('Check snoozed! You earned 2 points and the sender earned 1 point.');
}

// Award points to a user
function awardPoints(userId, points) {
    sqlDb.run(
        'UPDATE users SET score = score + ? WHERE id = ?',
        [points, userId]
    );
}

// Update checks remaining
function updateChecksRemaining() {
    const result = sqlDb.exec(`
        SELECT checks_sent FROM users WHERE id = ${currentUser}
    `);
    
    if (result.length && result[0].values.length) {
        const checksSent = result[0].values[0][0];
        checksRemaining = Math.max(0, 3 - checksSent);
        checksRemainingSpan.textContent = checksRemaining;
    }
}

// Reset daily checks if needed
function resetDailyChecksIfNeeded() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const result = sqlDb.exec(`
        SELECT id, last_reset_date FROM users
    `);
    
    if (result.length && result[0].values.length) {
        result[0].values.forEach(user => {
            const userId = user[0];
            const lastResetDate = user[1];
            
            if (lastResetDate !== today) {
                sqlDb.run(
                    'UPDATE users SET checks_sent = 0, last_reset_date = ? WHERE id = ?',
                    [today, userId]
                );
            }
        });
    }
}

// Update UI with latest data
function updateUI() {
    // Update scores
    const result = sqlDb.exec('SELECT id, score FROM users');
    
    if (result.length && result[0].values.length) {
        result[0].values.forEach(user => {
            const userId = user[0];
            const score = user[1];
            
            if (userId === 1) {
                user1ScoreSpan.textContent = score;
            } else if (userId === 2) {
                user2ScoreSpan.textContent = score;
            }
        });
    }
    
    // Update checks remaining
    updateChecksRemaining();
}