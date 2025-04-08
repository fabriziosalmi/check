// Check-in Web App JavaScript

// DOM Elements
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const checkBtn = document.getElementById('check-btn');
const usernameDisplay = document.getElementById('username');
const scoreDisplay = document.getElementById('score');
const pendingChecksContainer = document.getElementById('pending-checks-container');
const historyContainer = document.getElementById('history-container');
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');
const notificationContainer = document.getElementById('notification-container');
const inviteSection = document.getElementById('invite-section');
const inviteLink = document.getElementById('invite-link');
const copyInviteBtn = document.getElementById('copy-invite-btn');

// App State
let currentUser = null;
let checks = [];
let connectedUsers = [];
let inviteToken = null;
let invitedBy = null;

// Check if user is already logged in (from localStorage)
function initApp() {
    // Check for invite token in URL
    const urlParams = new URLSearchParams(window.location.search);
    inviteToken = urlParams.get('invite');
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loadUserData();
        showAppSection();
    } else {
        showAuthSection();
        
        // If there's an invite token, show it in the login form
        if (inviteToken) {
            const inviteInfo = document.getElementById('invite-info');
            if (inviteInfo) {
                inviteInfo.textContent = 'You were invited to join! Enter your nickname to continue.';
                inviteInfo.classList.remove('hidden');
            }
        }
    }

    // Register event listeners
    registerEventListeners();
}

// Event Listeners
function registerEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username-input').value;
        login(username);
    });

    // Check button
    checkBtn.addEventListener('click', () => {
        createCheck();
    });

    // Logout button
    logoutBtn.addEventListener('click', () => {
        logout();
    });
    
    // Copy invite link button
    if (copyInviteBtn) {
        copyInviteBtn.addEventListener('click', () => {
            copyInviteLinkToClipboard();
        });
    }
}

// Authentication Functions
function login(username) {
    // In a real app, this would be an API call to validate credentials
    // For demo purposes, we'll simulate a successful login
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.username === username);
    
    // If user doesn't exist, create a new one
    if (!user) {
        user = {
            username: username,
            score: 0,
            checks: [],
            connections: [],
            inviteToken: generateInviteToken(username)
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    currentUser = {
        username: user.username,
        score: user.score || 0,
        checks: user.checks || [],
        connections: user.connections || [],
        inviteToken: user.inviteToken || generateInviteToken(username)
    };
    
    // If user was invited, connect them with the inviter
    if (inviteToken) {
        const inviter = findUserByInviteToken(inviteToken);
        if (inviter) {
            // Connect the users if they aren't already connected
            if (!currentUser.connections.includes(inviter.username)) {
                currentUser.connections.push(inviter.username);
                
                // Also connect the inviter to this user
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const inviterIndex = users.findIndex(u => u.username === inviter.username);
                if (inviterIndex !== -1 && !users[inviterIndex].connections.includes(currentUser.username)) {
                    users[inviterIndex].connections.push(currentUser.username);
                    localStorage.setItem('users', JSON.stringify(users));
                }
                
                invitedBy = inviter.username;
                showNotification(`Connected with ${inviter.username}!`, 'success');
            }
        }
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loadUserData();
    showAppSection();
    showNotification('Login successful!', 'success');
    
    // Generate invite link for first-time users or if they have no connections
    if (currentUser.connections.length === 0) {
        generateAndShowInviteLink();
    }
}

// UI Functions

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAuthSection();
    showNotification('Logged out successfully', 'success');
}

function showAuthSection() {
    loginSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    logoutBtn.classList.add('hidden');
}

function showAppSection() {
    loginSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    
    // Always show invite section to allow connecting with more users
    if (inviteSection) {
        inviteSection.classList.remove('hidden');
        generateAndShowInviteLink();
    }
    
    // Update the receiver selection dropdown if user has connections
    updateReceiverSelection();
}

function loadUserData() {
    if (!currentUser) return;
    
    usernameDisplay.textContent = currentUser.username;
    scoreDisplay.textContent = `Score: ${currentUser.score}`;
    
    // Load user's check history
    checks = currentUser.checks || [];
    
    // Load connected users data
    loadConnectedUsers();
    
    // Render checks (will now only show checks between connected users)
    renderChecks();
    
    // Display connections information
    displayConnectionsInfo();
    
    // If user was invited, show a welcome message
    if (invitedBy) {
        showNotification(`Welcome! You were invited by ${invitedBy}`, 'info');
        invitedBy = null; // Clear it so it doesn't show again
    }
}

// Load data for all users connected to the current user
function loadConnectedUsers() {
    if (!currentUser || !currentUser.connections || currentUser.connections.length === 0) {
        connectedUsers = [];
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    connectedUsers = users.filter(user => currentUser.connections.includes(user.username));
    
    // Update the receiver selection dropdown
    updateReceiverSelection();
}

// Update the receiver selection dropdown
function updateReceiverSelection() {
    const receiverSelection = document.getElementById('receiver-selection');
    const receiverSelect = document.getElementById('receiver-select');
    
    if (!receiverSelection || !receiverSelect || !currentUser || !currentUser.connections) return;
    
    // Clear existing options
    receiverSelect.innerHTML = '';
    
    // If user has connections, show the dropdown
    if (currentUser.connections.length > 0) {
        receiverSelection.classList.remove('hidden');
        
        // Add options for each connected user
        currentUser.connections.forEach(username => {
            const option = document.createElement('option');
            option.value = username;
            option.textContent = username;
            receiverSelect.appendChild(option);
        });
    } else {
        // Hide the dropdown if user has no connections
        receiverSelection.classList.add('hidden');
    }
}

// Check-in Functions
function createCheck() {
    if (!currentUser) return;
    
    // Check if user has any connections
    if (!currentUser.connections || currentUser.connections.length === 0) {
        showNotification('You need to connect with someone first!', 'warning');
        generateAndShowInviteLink();
        return;
    }
    
    // If user has multiple connections, show a dialog to select the receiver
    let receiver;
    if (currentUser.connections.length > 1) {
        receiver = document.getElementById('receiver-select').value;
    } else {
        receiver = currentUser.connections[0];
    }
    
    const now = new Date();
    const newCheck = {
        id: Date.now().toString(),
        timestamp: now.getTime(),
        status: 'pending',
        expiresAt: now.getTime() + (5 * 60 * 1000), // Expires in 5 minutes
        sender: currentUser.username,
        receiver: receiver,
        pairId: generatePairId(currentUser.username, receiver)
    };
    
    checks.unshift(newCheck); // Add to beginning of array
    updateUserChecks();
    renderChecks();
    showNotification('Check-in created! Confirm within 5 minutes.', 'warning');
}

function confirmCheck(checkId) {
    const checkIndex = checks.findIndex(check => check.id === checkId);
    if (checkIndex === -1) return;
    
    const check = checks[checkIndex];
    const now = Date.now();
    
    // Verify this check is intended for the current user
    if (check.receiver !== currentUser.username) {
        showNotification('This check is not for you to confirm', 'error');
        return;
    }
    
    if (now > check.expiresAt) {
        check.status = 'expired';
        showNotification('Check-in expired!', 'error');
    } else {
        check.status = 'confirmed';
        currentUser.score += 10; // Award points for successful check-in
        scoreDisplay.textContent = `Score: ${currentUser.score}`;
        showNotification('Check-in confirmed! +10 points', 'success');
        
        // Also update the sender's check status
        updateSenderCheckStatus(check);
    }
    
    updateUserChecks();
    renderChecks();
}

// Update the check status for the sender as well
function updateSenderCheckStatus(check) {
    if (!check.sender || check.sender === currentUser.username) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const senderIndex = users.findIndex(u => u.username === check.sender);
    
    if (senderIndex !== -1) {
        const sender = users[senderIndex];
        const senderChecks = sender.checks || [];
        const senderCheckIndex = senderChecks.findIndex(c => c.id === check.id);
        
        if (senderCheckIndex !== -1) {
            senderChecks[senderCheckIndex].status = 'confirmed';
            sender.checks = senderChecks;
            users[senderIndex] = sender;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

function updateUserChecks() {
    if (!currentUser) return;
    
    currentUser.checks = checks;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Also update in the users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex !== -1) {
        users[userIndex].checks = checks;
        users[userIndex].score = currentUser.score;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function renderChecks() {
    // Clear both containers
    pendingChecksContainer.innerHTML = '';
    historyContainer.innerHTML = '';
    
    if (checks.length === 0) {
        pendingChecksContainer.innerHTML = '<div class="check-item">No pending checks</div>';
        historyContainer.innerHTML = '<div class="check-item">No check history</div>';
        return;
    }
    
    // Get all checks that involve the current user (sent or received) AND are between connected users
    const relevantChecks = checks.filter(check => {
        // Check must involve the current user
        const involvesCurrentUser = (check.sender === currentUser.username || check.receiver === currentUser.username);
        
        // The other party must be in the user's connections
        const otherParty = check.sender === currentUser.username ? check.receiver : check.sender;
        const isConnected = currentUser.connections && currentUser.connections.includes(otherParty);
        
        return involvesCurrentUser && isConnected;
    });
    
    if (relevantChecks.length === 0) {
        pendingChecksContainer.innerHTML = '<div class="check-item">No pending checks</div>';
        historyContainer.innerHTML = '<div class="check-item">No check history</div>';
        return;
    }
    
    // Filter checks by status
    const pendingChecks = relevantChecks.filter(check => check.status === 'pending');
    const historyChecks = relevantChecks.filter(check => check.status !== 'pending');
    
    // Render pending checks
    if (pendingChecks.length === 0) {
        pendingChecksContainer.innerHTML = '<div class="check-item">No pending checks</div>';
    } else {
        pendingChecks.forEach(check => renderCheckItem(check, pendingChecksContainer));
    }
    
    // Render history checks
    if (historyChecks.length === 0) {
        historyContainer.innerHTML = '<div class="check-item">No check history</div>';
    } else {
        historyChecks.forEach(check => renderCheckItem(check, historyContainer));
    }
}

function renderCheckItem(check, container) {
    const checkEl = document.createElement('div');
    checkEl.className = 'check-item';
    checkEl.dataset.checkId = check.id;
    
    const date = new Date(check.timestamp);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    
    const checkInfo = document.createElement('div');
    checkInfo.className = 'check-info';
    
    // Add sender/receiver info
    const participantEl = document.createElement('div');
    participantEl.className = 'check-participant';
    
    if (check.sender === currentUser.username) {
        participantEl.textContent = `To: ${check.receiver}`;
    } else {
        participantEl.textContent = `From: ${check.sender}`;
    }
    
    const timeEl = document.createElement('div');
    timeEl.className = 'check-time';
    timeEl.textContent = formattedDate;
    
    checkInfo.appendChild(participantEl);
    checkInfo.appendChild(timeEl);
    checkEl.appendChild(checkInfo);
    
    const statusEl = document.createElement('span');
    statusEl.className = `check-status status-${check.status}`;
    statusEl.textContent = check.status.charAt(0).toUpperCase() + check.status.slice(1);
    checkEl.appendChild(statusEl);
    
    // Only show confirm button if this check is pending AND is for the current user
    if (check.status === 'pending') {
        // Add timer
        const timerEl = document.createElement('span');
        timerEl.className = 'timer';
        checkEl.appendChild(timerEl);
        
        // Only add confirm button if user is the receiver
        if (check.receiver === currentUser.username) {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'confirm-btn';
            confirmBtn.textContent = 'Confirm';
            confirmBtn.addEventListener('click', () => confirmCheck(check.id));
            checkEl.appendChild(confirmBtn);
        }
        
        // Start timer
        updateTimer(timerEl, check.expiresAt);
    }
    
    container.appendChild(checkEl);
}

function updateTimer(timerEl, expiresAt) {
    const interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = expiresAt - now;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            timerEl.textContent = 'Expired';
            // Refresh the checks to update the status
            const checkId = timerEl.parentElement.dataset.checkId;
            const checkIndex = checks.findIndex(check => check.id === checkId);
            if (checkIndex !== -1) {
                checks[checkIndex].status = 'expired';
                updateUserChecks();
                renderChecks();
            }
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Invite Functions
function generateInviteToken(username) {
    // Generate a simple token based on username and timestamp
    return btoa(`${username}-${Date.now()}`);
}

// Generate a unique ID for a pair of users
function generatePairId(user1, user2) {
    // Sort usernames to ensure the same pair ID regardless of order
    const sortedUsers = [user1, user2].sort();
    return `${sortedUsers[0]}_${sortedUsers[1]}`;
}

// Display connections information
function displayConnectionsInfo() {
    const connectionsInfo = document.getElementById('connections-info');
    if (!connectionsInfo || !currentUser) return;
    
    // Clear existing content
    connectionsInfo.innerHTML = '';
    
    if (!currentUser.connections || currentUser.connections.length === 0) {
        connectionsInfo.innerHTML = '<p>You are not connected with anyone yet. Invite someone to get started!</p>';
        return;
    }
    
    // Create a heading
    const heading = document.createElement('h3');
    heading.textContent = 'Your Connections';
    connectionsInfo.appendChild(heading);
    
    // Create a list of connections
    const connectionsList = document.createElement('ul');
    connectionsList.className = 'connections-list';
    
    currentUser.connections.forEach(username => {
        const listItem = document.createElement('li');
        listItem.textContent = username;
        connectionsList.appendChild(listItem);
    });
    
    connectionsInfo.appendChild(connectionsList);
}

function findUserByInviteToken(token) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(user => user.inviteToken === token);
}

function generateAndShowInviteLink() {
    if (!currentUser || !inviteLink) return;
    
    // Create the invite URL with the token
    const baseUrl = window.location.href.split('?')[0]; // Remove any existing query params
    const inviteUrl = `${baseUrl}?invite=${currentUser.inviteToken}`;
    
    // Display the invite link
    inviteLink.value = inviteUrl;
    inviteLink.classList.remove('hidden');
    if (copyInviteBtn) {
        copyInviteBtn.classList.remove('hidden');
    }
}

function copyInviteLinkToClipboard() {
    if (!inviteLink) return;
    
    inviteLink.select();
    document.execCommand('copy');
    
    // Deselect the text
    window.getSelection().removeAllRanges();
    
    showNotification('Invite link copied to clipboard!', 'success');
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);