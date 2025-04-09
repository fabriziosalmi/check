// improved_app.js

// --- Configuration & State ---
const DAILY_CHECK_LIMIT = 3;
const CHECK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

let appState = {
    currentUser: 1, // Default to User 1
    sqlDb: null,
    checksRemaining: DAILY_CHECK_LIMIT,
    activeTimers: [],
};

// --- DOM Elements ---
// Group DOM elements for clarity
const DOM = {};

// --- Initialization ---
window.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    console.log("Initializing application...");
    try {
        // Cache DOM Elements
        DOM.user1Btn = document.getElementById('user1-btn');
        DOM.user2Btn = document.getElementById('user2-btn');
        DOM.currentUserSpan = document.getElementById('current-user');
        DOM.checksRemainingSpan = document.getElementById('checks-remaining');
        DOM.checkMessageInput = document.getElementById('check-message');
        DOM.sendCheckBtn = document.getElementById('send-check');
        DOM.user1ScoreSpan = document.getElementById('user1-score');
        DOM.user2ScoreSpan = document.getElementById('user2-score');
        DOM.checksContainer = document.getElementById('checks-container');
        DOM.noChecksMessage = document.getElementById('no-checks-message');
        
        // Create outgoing checks section if it doesn't exist
        if (!document.getElementById('outgoing-checks-section')) {
            const incomingSection = document.querySelector('.bg-white.rounded-xl.shadow-lg.p-6');
            if (incomingSection) {
                const outgoingSection = document.createElement('div');
                outgoingSection.className = 'bg-white rounded-xl shadow-lg p-6 mb-6';
                outgoingSection.innerHTML = `
                    <h2 class="text-2xl font-bold text-indigo-800 mb-4 text-center sm:text-left">Checks in uscita</h2>
                    <div id="outgoing-checks-container" class="space-y-4">
                        <p id="no-outgoing-checks-message" class="text-gray-500 text-center py-4 italic">Nessun check in uscita.</p>
                    </div>
                `;
                incomingSection.parentNode.insertBefore(outgoingSection, incomingSection);
            }
        }
        
        // Cache the outgoing checks elements
        DOM.outgoingChecksContainer = document.getElementById('outgoing-checks-container');
        DOM.noOutgoingChecksMessage = document.getElementById('no-outgoing-checks-message');

        // Validate all required DOM elements
        for (const key in DOM) {
            if (!DOM[key]) {
                throw new Error(`Required DOM element not found: ${key}`);
            }
        }
        console.log("DOM elements cached.");

        // Initialize SQL.js
        console.log("Initializing SQL.js...");
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        appState.sqlDb = new SQL.Database();
        console.log("SQL.js initialized, database created.");

        // Setup Database Schema and Initial Data
        setupDatabase();
        console.log("Database setup complete.");

        // Reset daily checks if it's a new day
        resetDailyChecksIfNeeded();
        console.log("Daily checks verified/reset.");

        // Set initial UI state (loads checks for default user)
        // We directly call switchUser here as it's the initial load,
        // the restriction logic applies to subsequent *user-initiated* switches.
        switchUser(appState.currentUser);

        // --- MODIFIED Event Listeners (using requestUserSwitch) ---
        DOM.user1Btn.addEventListener('click', () => requestUserSwitch(1));
        DOM.user2Btn.addEventListener('click', () => requestUserSwitch(2));
        // Send check listener remains the same
        DOM.sendCheckBtn.addEventListener('click', sendCheck);
        // --- END MODIFICATION ---

        console.log("Event listeners added.");
        console.log("App initialized successfully.");

    } catch (error) {
        console.error("Error initializing app:", error);
        alert(`Failed to initialize the app: ${error.message}. Please check the console and refresh the page.`);
        // Disable interactive elements if initialization fails
        if (DOM.sendCheckBtn) DOM.sendCheckBtn.disabled = true;
        if (DOM.checkMessageInput) DOM.checkMessageInput.disabled = true;
    }
}

// --- Database Functions ---

function setupDatabase() {
    const db = appState.sqlDb;
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            score INTEGER DEFAULT 0,
            checks_sent INTEGER DEFAULT 0,
            last_reset_date TEXT DEFAULT CURRENT_DATE
        );

        CREATE TABLE IF NOT EXISTS checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            sent_time INTEGER NOT NULL, -- Store as Unix timestamp (milliseconds)
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'snoozed', 'expired')),
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        );
    `);

    // Use INSERT OR IGNORE to avoid errors if users already exist
    db.run("INSERT OR IGNORE INTO users (id, name, score, checks_sent) VALUES (?, ?, ?, ?)", [1, 'Fab', 0, 0]);
    db.run("INSERT OR IGNORE INTO users (id, name, score, checks_sent) VALUES (?, ?, ?, ?)", [2, 'Dome', 0, 0]);
}

function resetDailyChecksIfNeeded() {
    const db = appState.sqlDb;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    try {
        // Get current user's data including checks_sent and last_reset_date
        const stmt = db.prepare("SELECT checks_sent, last_reset_date FROM users WHERE id = ?");
        const userData = stmt.getAsObject([appState.currentUser]);
        stmt.free();

        // Only reset if it's a new day
        if (userData.last_reset_date !== today) {
            console.log(`Resetting daily checks for user ${appState.currentUser} (new day: ${today})`);
            db.exec('BEGIN TRANSACTION');
            try {
                // Reset checks_sent and update last_reset_date
                db.run("UPDATE users SET checks_sent = 0, last_reset_date = ? WHERE id = ?", [today, appState.currentUser]);
                // Update app state
                appState.checksRemaining = DAILY_CHECK_LIMIT;
                db.exec('COMMIT');
            } catch (error) {
                db.exec('ROLLBACK');
                console.error("Error resetting daily checks:", error);
            }
        } else {
            // If same day, just update checksRemaining based on current checks_sent
            appState.checksRemaining = Math.max(0, DAILY_CHECK_LIMIT - userData.checks_sent);
            console.log(`Same day: ${today}, checks remaining: ${appState.checksRemaining}`);
        }
    } catch (error) {
        console.error("Error checking daily reset:", error);
    }
}

// --- Database Helper Functions ---
// (getUserData is not directly used below, but kept for potential utility)
function getUserData(userId) {
    const stmt = appState.sqlDb.prepare("SELECT id, name, score, checks_sent FROM users WHERE id = :id");
    // Use getAsObject() for easy access by column name
    const result = stmt.getAsObject({ ':id': userId });
    stmt.free();
    return result; // Returns { id: x, name: '...', score: y, checks_sent: z } or {} if not found
}

function getUserScore(userId) {
     const stmt = appState.sqlDb.prepare("SELECT score FROM users WHERE id = :id");
     const result = stmt.get({ ':id': userId });
     stmt.free();
     return result ? result[0] : 0;
}

function getChecksSentCount(userId) {
     const stmt = appState.sqlDb.prepare("SELECT checks_sent FROM users WHERE id = :id");
     const result = stmt.get({ ':id': userId });
     stmt.free();
     return result ? result[0] : 0;
}

// --- Core Logic Functions ---

// NEW FUNCTION: Gatekeeper for user switching
function requestUserSwitch(requestedUserId) {
    console.log(`User switch requested to: ${requestedUserId}`);
    const currentUser = appState.currentUser;

    if (requestedUserId === currentUser) {
        console.log("Already the current user. No switch needed.");
        return; // No action needed if clicking the active user button
    }

    // Check if the CURRENT user (the one we are trying to switch *from*)
    // has pending INCOMING checks that require snoozing.
    try {
        const checkStmt = appState.sqlDb.prepare(
            "SELECT COUNT(*) FROM checks WHERE receiver_id = :receiver AND status = 'pending'"
        );
        // Check against the user we are trying to navigate AWAY from
        const pendingIncomingChecks = checkStmt.get({ ':receiver': currentUser })[0];
        checkStmt.free();

        console.log(`User ${currentUser} has ${pendingIncomingChecks} incoming pending checks.`);

        if (pendingIncomingChecks > 0) {
            // If the current user has pending checks, block switching away
            // Get current user's name for the alert
            const currentUserName = DOM.currentUserSpan.textContent || `User ${currentUser}`;
            alert(`${currentUserName} has incoming checks that need attention. Please snooze them before switching users.`);
        } else {
            // No pending checks for the current user, allow the switch
            console.log(`Allowing switch from ${currentUser} to ${requestedUserId}`);
            switchUser(requestedUserId); // Proceed with the actual switch
        }
    } catch (error) {
        console.error("Error checking for pending checks during user switch:", error);
        alert("Could not verify pending checks. Please try again.");
        // Optionally, you might allow the switch anyway or keep it blocked
    }
}

// This function now only executes *after* requestUserSwitch allows it
function switchUser(userId) {
    // No need to check if (appState.currentUser === userId) as requestUserSwitch handles it

    console.log(`Switching UI and state to user: ${userId}`);
    appState.currentUser = userId;
    clearAllTimers(); // Clear timers before loading new state/checks

    // Update UI elements immediately related to user switching (buttons, name display)
    updateUserSwitchUI(userId);

    // Fetch general user data and update the rest of the UI (scores, checks remaining)
    updateUI();

    // Load both incoming and outgoing checks for the newly selected user
    loadChecks();
    loadOutgoingChecks();

    // Clear message input for the new user
    if (DOM.checkMessageInput) {
        DOM.checkMessageInput.value = '';
        DOM.checkMessageInput.focus();
    }
}

// Includes debugging logs
function sendCheck() {
    console.log("sendCheck triggered"); // Log entry
    if (!DOM.checkMessageInput || !appState.sqlDb) {
        console.error('Check message input or database not initialized');
        alert('Application not fully initialized. Please refresh the page.');
        return;
    }

    const message = DOM.checkMessageInput.value.trim();
    console.log("Message:", message); // Log message
    if (!message) {
        alert('Please enter a check message.');
        DOM.checkMessageInput.focus();
        return;
    }

    console.log("Checks remaining for current user:", appState.checksRemaining); // Log checks remaining
    if (appState.checksRemaining <= 0) {
        alert('You have no checks remaining today.');
        return;
    }

    // Check for pending checks sent TO the other user FROM the current user
    const receiverId = appState.currentUser === 1 ? 2 : 1;
    console.log(`Current User (Sender): ${appState.currentUser}, Intended Receiver: ${receiverId}`); // Log users involved

    const pendingCheckStmt = appState.sqlDb.prepare(
        "SELECT COUNT(*) FROM checks WHERE sender_id = :sender AND receiver_id = :receiver AND status = 'pending'"
    );
    const pendingChecksCount = pendingCheckStmt.get({
        ':sender': appState.currentUser,
        ':receiver': receiverId
    })[0];
    pendingCheckStmt.free();

    // *** THIS LOG IS IMPORTANT FOR DEBUGGING THE BLOCK ***
    console.log(`Pending checks count FROM ${appState.currentUser} TO ${receiverId}:`, pendingChecksCount);

    // Block sending if the receiver hasn't handled the last check from this sender
    if (pendingChecksCount > 0) {
        alert('The other user has not yet responded to your last check. Please wait.');
        return; // <<<< SENDING BLOCKED HERE IF COUNT > 0
    }

    // Proceed with sending the check
    try {
        console.log("Attempting database transaction to send check...");
        appState.sqlDb.exec('BEGIN TRANSACTION');

        const currentTime = Date.now();
        // Insert the new check
        appState.sqlDb.run(
            'INSERT INTO checks (sender_id, receiver_id, message, sent_time, status) VALUES (?, ?, ?, ?, ?)',
            [appState.currentUser, receiverId, message, currentTime, 'pending']
        );

        // Update the sender's checks_sent count
        appState.sqlDb.run(
            'UPDATE users SET checks_sent = checks_sent + 1 WHERE id = ?',
            [appState.currentUser]
        );

        appState.sqlDb.exec('COMMIT');
        console.log("Transaction committed successfully.");

        console.log(`User ${appState.currentUser} successfully sent check to User ${receiverId}`);

        // Clear input field
        DOM.checkMessageInput.value = '';

        // Update UI (reflects the decreased checks remaining for the sender)
        updateUI();
        
        // Refresh outgoing checks to show the newly sent check
        loadOutgoingChecks();

        alert('Check sent successfully!');

    } catch (error) {
        console.error('Error during sendCheck database transaction:', error);
        appState.sqlDb.exec('ROLLBACK'); // Rollback on error
        alert('Failed to send check due to a database error. Please try again.');
    }
}


function loadChecks() {
    console.log(`Loading pending checks for User ${appState.currentUser}`);
    clearAllTimers(); // Stop existing timers before loading/starting new ones

    try {
        // Validate database state
        if (!appState.sqlDb) {
            throw new Error('Database not initialized');
        }

        // Validate current user
        const userStmt = appState.sqlDb.prepare('SELECT id FROM users WHERE id = ?');
        const userExists = userStmt.get([appState.currentUser]);
        userStmt.free();

        if (!userExists) {
            throw new Error(`Invalid user ID: ${appState.currentUser}`);
        }

        // Fetch pending checks where the current user is the receiver
        const stmt = appState.sqlDb.prepare(`
            SELECT c.id, c.sender_id, c.message, c.sent_time, c.status, u.name as sender_name
            FROM checks c
            JOIN users u ON c.sender_id = u.id
            WHERE c.receiver_id = :receiver AND c.status = 'pending'
            ORDER BY c.sent_time ASC -- Show oldest first to prioritize
        `);
        const results = stmt.all({ ':receiver': appState.currentUser });
        stmt.free();

        // Clear checks container efficiently and add back the 'no checks' message as a base
        DOM.checksContainer.innerHTML = '';
        DOM.checksContainer.appendChild(DOM.noChecksMessage);

        if (!results || results.length === 0) {
            DOM.noChecksMessage.style.display = 'block'; // Show message
            console.log("No pending incoming checks found.");
            return; // Exit if no checks to display
        }

        // Checks found, hide the 'no checks' message
        DOM.noChecksMessage.style.display = 'none';

        const fragment = document.createDocumentFragment(); // Use fragment for batch DOM append

        console.log(`Found ${results.length} pending incoming checks.`);

        results.forEach(checkData => {
            // Destructure for clarity, indices match SELECT order
            const [checkId, senderId, message, sentTime, status, senderName] = checkData;
            const checkElement = createCheckElement(checkId, senderId, senderName, message, sentTime);
            fragment.appendChild(checkElement);
            // Start a timer for this specific check element
            startCheckTimer(checkElement.querySelector('.check-timer'), checkId, senderId, sentTime);
        });

        // Append all new check elements at once
        DOM.checksContainer.appendChild(fragment);

    } catch (error) {
        console.error("Errore nel caricare i checks:", error);
        DOM.noChecksMessage.textContent = 'Errore durante il caricamento dei checks in ingresso.'; // Update message on error
        DOM.noChecksMessage.style.display = 'block';
    }
}

// Includes safety check
function snoozeCheck(checkId, senderId) {
    console.log(`Attempting snooze for check ID: ${checkId} from sender ID: ${senderId} by current user ${appState.currentUser}`);
    try {
        // Safety Check: Verify the current user is the actual receiver of this check
        const checkDetailsStmt = appState.sqlDb.prepare("SELECT receiver_id, status FROM checks WHERE id = ?");
        const checkDetails = checkDetailsStmt.get([checkId]);
        checkDetailsStmt.free();

        if (!checkDetails || checkDetails.length === 0) {
            console.warn(`Snooze rejected: Check ID ${checkId} not found.`);
            alert("Cannot snooze: Check not found.");
            loadChecks(); // Refresh view in case check expired simultaneously
            return;
        }

        const [receiverId, currentStatus] = checkDetails;

        if (receiverId !== appState.currentUser) {
             console.warn(`Snooze rejected: User ${appState.currentUser} tried to snooze check ${checkId} assigned to user ${receiverId}.`);
             alert("You can only snooze checks sent directly to you.");
             return;
        }

        if (currentStatus !== 'pending') {
             console.warn(`Snooze rejected: Check ID ${checkId} has status '${currentStatus}', not 'pending'.`);
             alert(`Cannot snooze: This check is already ${currentStatus}.`);
             loadChecks(); // Refresh view
             return;
        }

        // Proceed with snooze transaction
        appState.sqlDb.exec('BEGIN TRANSACTION');

        // Update check status to 'snoozed' only if it's still 'pending' and for the correct user
        appState.sqlDb.run(
            'UPDATE checks SET status = "snoozed" WHERE id = ? AND receiver_id = ? AND status = "pending"',
            [checkId, appState.currentUser]
        );

        // Award points: 1 to sender, 2 to snoozer (current user)
        appState.sqlDb.run('UPDATE users SET score = score + 1 WHERE id = ?', [senderId]);
        appState.sqlDb.run('UPDATE users SET score = score + 2 WHERE id = ?', [appState.currentUser]);

        appState.sqlDb.exec('COMMIT');
        console.log(`Check ${checkId} snoozed successfully.`);

        // Update UI: Reload checks to remove the snoozed one, update scores
        loadChecks();
        loadOutgoingChecks(); // Also refresh outgoing checks
        updateUI();

        alert('Check snoozed! Hai guadagnato 2 punti per la snooze, chi ha inviato il check ha preso 1 punto.');

    } catch (error) {
        appState.sqlDb.exec('ROLLBACK');
        console.error('Errore durante lo snooze:', error);
        alert('Errore database durante lo snooze. Riprova ancora.');
    }
}


function handleCheckExpiration(checkId, senderId) {
    console.log(`Handling expiration for check ID: ${checkId}. Awarding point to sender ID: ${senderId}`);
    try {
        appState.sqlDb.exec('BEGIN TRANSACTION');

        // Update check status to 'expired' only if it's currently 'pending'
        // This prevents accidental updates if status changed rapidly (e.g., snoozed just before expiring)
        const changes = appState.sqlDb.run('UPDATE checks SET status = "expired" WHERE id = ? AND status = "pending"', [checkId]);

        // Only award point if the status was actually changed to expired
        if (changes > 0) {
            appState.sqlDb.run('UPDATE users SET score = score + 1 WHERE id = ?', [senderId]);
             console.log(`Point awarded to sender ${senderId} for expired check ${checkId}.`);
        } else {
            console.log(`Check ${checkId} status was not 'pending' during expiration handling. No point awarded.`);
        }

        appState.sqlDb.exec('COMMIT');

        // Update UI: Reload checks (will remove the expired one from view)
        // and update scores regardless.
        // Important: Check if the expired check was for the currently viewed user
        if (document.querySelector(`.check-timer[data-check-id="${checkId}"]`)) {
            // If the timer element still exists in the current view, reload checks
            loadChecks();
            loadOutgoingChecks();
        }
        updateUI(); // Always update scores

    } catch (error) {
        appState.sqlDb.exec('ROLLBACK');
        console.error('Error handling check expiration:', error);
    }
}


// --- Timer Functions ---

function clearAllTimers() {
    console.log(`Clearing ${appState.activeTimers.length} active timers`);
    // Clear all intervals to prevent memory leaks
    appState.activeTimers.forEach(timer => {
        clearInterval(timer.intervalId);
    });
    // Reset the timers array
    appState.activeTimers = [];
}

function startCheckTimer(timerElement, checkId, senderId, sentTime) {
    // Find existing timer for this checkId if any (e.g., after quick user switch back and forth)
    const existingTimerIndex = appState.activeTimers.findIndex(t => t.checkId === checkId);
    if (existingTimerIndex > -1) {
        console.log(`Timer for check ${checkId} already exists. Clearing old one.`);
        clearInterval(appState.activeTimers[existingTimerIndex].intervalId);
        appState.activeTimers.splice(existingTimerIndex, 1);
    }

    const updateTimerDisplay = () => {
        const now = Date.now();
        const elapsed = now - sentTime;
        const timeRemaining = Math.max(0, CHECK_DURATION_MS - elapsed);

        // Ensure the timer element is still in the DOM
        if (!document.body.contains(timerElement)) {
             console.log(`Timer element for check ${checkId} removed from DOM. Clearing interval.`);
             clearInterval(intervalId);
             appState.activeTimers = appState.activeTimers.filter(t => t.checkId !== checkId);
             return;
        }


        if (timeRemaining <= 0) {
            // Timer expired
            clearInterval(intervalId);
            // Remove timer from active list
            appState.activeTimers = appState.activeTimers.filter(t => t.checkId !== checkId);
            // Update UI immediately to show expired using animation frame
             requestAnimationFrame(() => {
                 if (timerElement) timerElement.textContent = 'Expired';
             });
            // Handle DB update for expiration
            handleCheckExpiration(checkId, senderId);
        } else {
            // Update display (only update DOM ~once per second)
            const totalSeconds = Math.floor(timeRemaining / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            // Use requestAnimationFrame for smooth UI update
            requestAnimationFrame(() => {
                 if (timerElement) timerElement.textContent = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
            });
        }
    };

    // Run immediately to set initial time display correctly
    updateTimerDisplay();

    // Set interval and store reference
    const intervalId = setInterval(updateTimerDisplay, 1000);
    const timer = { checkId, intervalId };
    appState.activeTimers.push(timer);
    console.log(`Started timer for check ${checkId}`);
}


// --- UI Update Functions ---

// Function to load outgoing checks (sent by current user and pending response)
function loadOutgoingChecks() {
    console.log(`Loading outgoing pending checks for User ${appState.currentUser}`);
    
    try {
        // Validate database state
        if (!appState.sqlDb) {
            throw new Error('Database not initialized');
        }

        // Fetch pending checks where the current user is the sender
        const stmt = appState.sqlDb.prepare(`
            SELECT c.id, c.receiver_id, c.message, c.sent_time, c.status, u.name as receiver_name
            FROM checks c
            JOIN users u ON c.receiver_id = u.id
            WHERE c.sender_id = :sender AND c.status = 'pending'
            ORDER BY c.sent_time DESC -- Show newest first
        `);
        const results = stmt.all({ ':sender': appState.currentUser });
        stmt.free();

        // Clear outgoing checks container and add back the 'no checks' message as a base
        DOM.outgoingChecksContainer.innerHTML = '';
        DOM.outgoingChecksContainer.appendChild(DOM.noOutgoingChecksMessage);

        if (!results || results.length === 0) {
            DOM.noOutgoingChecksMessage.style.display = 'block'; // Show message
            console.log("No pending outgoing checks found.");
            return; // Exit if no checks to display
        }

        // Checks found, hide the 'no checks' message
        DOM.noOutgoingChecksMessage.style.display = 'none';

        const fragment = document.createDocumentFragment(); // Use fragment for batch DOM append

        console.log(`Found ${results.length} pending outgoing checks.`);

        results.forEach(checkData => {
            // Destructure for clarity, indices match SELECT order
            const [checkId, receiverId, message, sentTime, status, receiverName] = checkData;
            const checkElement = createOutgoingCheckElement(checkId, receiverId, receiverName, message, sentTime);
            fragment.appendChild(checkElement);
            // Start a timer for this specific check element
            startCheckTimer(checkElement.querySelector('.check-timer'), checkId, appState.currentUser, sentTime);
        });

        // Append all new check elements at once
        DOM.outgoingChecksContainer.appendChild(fragment);

    } catch (error) {
        console.error("Error loading outgoing checks:", error);
        DOM.noOutgoingChecksMessage.textContent = 'Errore durante il caricamento dei checks in uscita.'; // Update message on error
        DOM.noOutgoingChecksMessage.style.display = 'block';
    }
}

function updateUserSwitchUI(userId) {
    // Update active button styles
    if (DOM.user1Btn && DOM.user2Btn) {
        if (userId === 1) {
            DOM.user1Btn.classList.replace('bg-gray-300', 'bg-indigo-600');
            DOM.user1Btn.classList.replace('text-gray-700', 'text-white');
            DOM.user1Btn.classList.replace('hover:bg-gray-400', 'hover:bg-indigo-700');
            DOM.user1Btn.setAttribute('aria-pressed', 'true');
            
            DOM.user2Btn.classList.replace('bg-indigo-600', 'bg-gray-300');
            DOM.user2Btn.classList.replace('text-white', 'text-gray-700');
            DOM.user2Btn.classList.replace('hover:bg-indigo-700', 'hover:bg-gray-400');
            DOM.user2Btn.setAttribute('aria-pressed', 'false');
        } else {
            DOM.user2Btn.classList.replace('bg-gray-300', 'bg-indigo-600');
            DOM.user2Btn.classList.replace('text-gray-700', 'text-white');
            DOM.user2Btn.classList.replace('hover:bg-gray-400', 'hover:bg-indigo-700');
            DOM.user2Btn.setAttribute('aria-pressed', 'true');
            
            DOM.user1Btn.classList.replace('bg-indigo-600', 'bg-gray-300');
            DOM.user1Btn.classList.replace('text-white', 'text-gray-700');
            DOM.user1Btn.classList.replace('hover:bg-indigo-700', 'hover:bg-gray-400');
            DOM.user1Btn.setAttribute('aria-pressed', 'false');
        }
    }

    // Update current user display
    if (DOM.currentUserSpan) {
        DOM.currentUserSpan.textContent = userId === 1 ? 'Fab' : 'Dome';
    }
}

function updateUI() {
    console.log("Updating general UI elements (scores, checks remaining)...");
    try {
        // Fetch current data needed using helper functions
        const checksSent = getChecksSentCount(appState.currentUser);
        const score1 = getUserScore(1);
        const score2 = getUserScore(2);

        appState.checksRemaining = Math.max(0, DAILY_CHECK_LIMIT - checksSent);

        // Update DOM elements within requestAnimationFrame for performance
        requestAnimationFrame(() => {
            if (DOM.checksRemainingSpan) DOM.checksRemainingSpan.textContent = appState.checksRemaining;
            if (DOM.user1ScoreSpan) DOM.user1ScoreSpan.textContent = score1;
            if (DOM.user2ScoreSpan) DOM.user2ScoreSpan.textContent = score2;

            // Enable/disable send button based on checks remaining
            if (DOM.sendCheckBtn) {
                 DOM.sendCheckBtn.disabled = appState.checksRemaining <= 0;
                 DOM.sendCheckBtn.title = appState.checksRemaining <= 0 ? "No checks remaining today" : "Send check";
            }
        });
        console.log(`UI Updated: Scores(${score1}/${score2}), Checks Remaining(${appState.checksRemaining} for User ${appState.currentUser})`);
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// --- UI Helper Functions ---

function createCheckElement(checkId, senderId, senderName, message, sentTime) {
    const checkElement = document.createElement('div');
    // Added unique ID to the element itself
    checkElement.id = `check-${checkId}`;
    checkElement.className = 'bg-indigo-50 rounded-lg p-4 border border-indigo-200 mb-3 animate-fade-in relative'; // Added relative positioning context if needed
    checkElement.dataset.checkId = checkId;

    // Calculate initial time remaining display
    const elapsed = Date.now() - sentTime;
    const timeRemaining = Math.max(0, CHECK_DURATION_MS - elapsed);
    const minutes = Math.floor(timeRemaining / (60 * 1000));
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
    const initialTimeText = timeRemaining > 0 ? `${minutes}m ${seconds.toString().padStart(2, '0')}s` : 'Expired';

    checkElement.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
            <div class="flex-grow">
                <p class="font-semibold text-indigo-800">${escapeHTML(senderName) || `User ${senderId}`}</p>
                <p class="text-sm text-gray-500">Time remaining:
                    <span class="check-timer font-medium text-red-600" data-check-id="${checkId}">${initialTimeText}</span>
                </p>
            </div>
            <div class="flex-shrink-0 self-start sm:self-center">
                <button class="snooze-btn px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1" data-id="${checkId}" type="button">
                   <i class="fas fa-bell-slash mr-1"></i> Snooze
                </button>
            </div>
        </div>
        <p class="text-gray-700 break-words mt-1">${escapeHTML(message)}</p>
    `;

    // Add event listener to snooze button
    const snoozeBtn = checkElement.querySelector('.snooze-btn');
    snoozeBtn.addEventListener('click', (e) => {
         e.target.disabled = true; // Prevent double clicks immediately
         // Add temporary visual feedback
         e.target.textContent = 'Snoozing...';
         // Call snooze function after a short delay to allow UI update
         setTimeout(() => snoozeCheck(checkId, senderId), 50);
    });

    return checkElement;
}

// Create an element for outgoing checks (sent by current user)
function createOutgoingCheckElement(checkId, receiverId, receiverName, message, sentTime) {
    const checkElement = document.createElement('div');
    checkElement.id = `outgoing-check-${checkId}`;
    checkElement.className = 'bg-green-50 rounded-lg p-4 border border-green-200 mb-3 animate-fade-in relative';
    checkElement.dataset.checkId = checkId;

    // Calculate initial time remaining display
    const elapsed = Date.now() - sentTime;
    const timeRemaining = Math.max(0, CHECK_DURATION_MS - elapsed);
    const minutes = Math.floor(timeRemaining / (60 * 1000));
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
    const initialTimeText = timeRemaining > 0 ? `${minutes}m ${seconds.toString().padStart(2, '0')}s` : 'Expired';

    checkElement.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
            <div class="flex-grow">
                <p class="font-semibold text-green-800">To: ${escapeHTML(receiverName) || `User ${receiverId}`}</p>
                <p class="text-sm text-gray-500">Time remaining:
                    <span class="check-timer font-medium text-red-600" data-check-id="${checkId}">${initialTimeText}</span>
                </p>
            </div>
            <div class="flex-shrink-0 self-start sm:self-center">
                <span class="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                   <i class="fas fa-clock mr-1"></i> Waiting
                </span>
            </div>
        </div>
        <p class="text-gray-700 break-words mt-1">${escapeHTML(message)}</p>
    `;

    return checkElement;
}

// Simple HTML escaping function
function escapeHTML(str) {
    if (str === null || str === undefined) return ''; // Handle null/undefined input
    const div = document.createElement('div');
    div.textContent = String(str); // Ensure input is treated as string
    return div.innerHTML;
}