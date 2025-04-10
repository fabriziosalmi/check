const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Store user data and game state
const users = {
  'fab': { points: 0, online: false },
  'dome': { points: 0, online: false }
};

let activeCheck = null;

// Debug helper function
function logGameState() {
  console.log('Current Game State:', {
    users,
    activeCheck: activeCheck ? {
      id: activeCheck.id,
      sender: activeCheck.sender,
      receiver: activeCheck.receiver,
      timeLeft: Math.floor((activeCheck.expiryTime - Date.now()) / 1000) + ' seconds'
    } : null
  });
}

// Socket connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // User login
  socket.on('login', (username) => {
    if (users[username]) {
      users[username].online = true;
      users[username].socketId = socket.id;
      socket.username = username;
      
      // Send current game state to the user
      socket.emit('gameState', { users, activeCheck });
      
      // Log the state being emitted
      console.log(`[Server] Emitting userUpdate after ${username} login. State:`, JSON.stringify(users));
      // Notify all users about the updated status
      io.emit('userUpdate', users);
      console.log(`${username} logged in`);
      logGameState(); // Log full state
    } else {
      socket.emit('loginError', 'Invalid username');
    }
  });
  
  // User logout
  socket.on('logout', () => {
    const username = socket.username;
    if (username && users[username]) {
      users[username].online = false;
      socket.username = null;
      
      // Notify all users about the updated status
      io.emit('userUpdate', users);
      console.log(`${username} logged out`);
    }
  });
  
  // Send a check
  socket.on('sendCheck', () => {
    const sender = socket.username;
    
    console.log('Attempting to send check. Sender:', sender);
    
    if (!sender || !users[sender]) {
      console.log('Error: User not logged in', socket.id);
      socket.emit('error', 'Not logged in');
      return;
    }
    
    if (activeCheck) {
      console.log('Error: Check already active', activeCheck);
      socket.emit('error', 'A check is already active');
      return;
    }
    
    // Find the other user
    const receiver = sender === 'fab' ? 'dome' : 'fab';
    
    console.log('Receiver status:', receiver, users[receiver].online);
    
    if (!users[receiver].online) {
      console.log('Error: Other user not online', receiver);
      socket.emit('error', 'Other user is not online');
      return;
    }
    
    // Create a new check
    const checkId = uuidv4();
    // For testing purposes, set expiry to 2 minutes instead of 30
    const expiryTime = Date.now() + 2 * 60 * 1000; // 2 minutes from now
    
    activeCheck = {
      id: checkId,
      sender,
      receiver,
      expiryTime,
      createdAt: Date.now()
    };
    
    console.log('Created check:', activeCheck);
    logGameState();
    
    // Schedule expiry
    setTimeout(() => {
      if (activeCheck && activeCheck.id === checkId) {
        console.log('Check expired:', checkId);
        // Check expired, sender gets 1 point
        users[sender].points += 1;
        io.emit('checkExpired', { 
          check: activeCheck, 
          newPoints: users[sender].points 
        });
        activeCheck = null;
        io.emit('gameState', { users, activeCheck });
        logGameState();
      }
    }, 2 * 60 * 1000); // 2 minutes timeout
    
    // Send the check to all clients
    io.emit('newCheck', activeCheck);
    io.emit('gameState', { users, activeCheck });
    
    console.log(`${sender} sent a check to ${receiver}`);
  });
  
  // Snooze a check
  socket.on('snoozeCheck', (checkId) => {
    const username = socket.username;
    
    if (!username || !users[username]) {
      socket.emit('error', 'Not logged in');
      return;
    }
    
    if (!activeCheck || activeCheck.id !== checkId) {
      socket.emit('error', 'Check not found or already expired');
      return;
    }
    
    if (username !== activeCheck.receiver) {
      socket.emit('error', 'This check is not for you');
      return;
    }
    
    // Check snoozed, receiver gets 2 points
    users[username].points += 2;
    io.emit('checkSnoozed', { 
      check: activeCheck, 
      snoozer: username, 
      newPoints: users[username].points 
    });
    
    // Clear the active check
    activeCheck = null;
    io.emit('gameState', { users, activeCheck });
    
    console.log(`${username} snoozed the check and got 2 points`);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    const username = socket.username;
    console.log('Client disconnected:', socket.id, 'Username:', username);
    if (username && users[username]) {
      users[username].online = false;
      // Clear socketId to prevent issues if the same user reconnects quickly
      users[username].socketId = null; 
      io.emit('userUpdate', users);
      console.log(`${username} marked as disconnected`);
      logGameState(); // Log state on disconnect
    } else {
      console.log('Disconnected client had no associated username.');
    }
  });
});

// Update package.json scripts
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});