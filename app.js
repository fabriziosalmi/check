import { initDatabase, getDb } from './db-init.js';
import {
  sendCheck,
  getIncomingChecks,
  getOutgoingChecks,
  snoozeCheck,
  expireOldChecks,
} from './check-manager.js';

let currentUser = 'fab';
const OTHER_USER = { fab: 'dome', dome: 'fab' };

const switchUser = (user) => {
  currentUser = user.toLowerCase();
  
  // Update active button styles
  const fabButton = document.getElementById('switchFab');
  const domeButton = document.getElementById('switchDome');
  
  if (currentUser === 'fab') {
    fabButton.classList.add('ring-4', 'ring-blue-300');
    domeButton.classList.remove('ring-4', 'ring-green-300');
  } else {
    domeButton.classList.add('ring-4', 'ring-green-300');
    fabButton.classList.remove('ring-4', 'ring-blue-300');
  }
  
  render();
};

const render = () => {
  try {
    document.getElementById('currentUser').textContent = currentUser;

    const db = window.db;
    if (!db) throw new Error('Database not available');

    const userRes = db.exec(`SELECT * FROM users WHERE id = ?`, [currentUser])[0];
    if (!userRes) throw new Error('User not found');
    
    const fabScore = db.exec(`SELECT score FROM users WHERE id = 'fab'`)[0].values[0][0];
    const domeScore = db.exec(`SELECT score FROM users WHERE id = 'dome'`)[0].values[0][0];

  const remaining = userRes.values[0][3];
  const lastDate = userRes.values[0][4];
  const today = new Date().toISOString().split('T')[0];
  const checksLeft = lastDate === today ? 3 - remaining : 3;

  // Update remaining checks with visual indicator
  const remainingEl = document.getElementById('remainingChecks');
  remainingEl.textContent = checksLeft;
  
  // Add color coding based on remaining checks
  if (checksLeft === 0) {
    remainingEl.className = 'font-bold text-red-600';
  } else if (checksLeft === 1) {
    remainingEl.className = 'font-bold text-orange-600';
  } else {
    remainingEl.className = 'font-bold text-green-600';
  }
  
  // Update scores with animations if they changed
  const scoreFabEl = document.getElementById('scoreFab');
  const scoreDomeEl = document.getElementById('scoreDome');
  
  if (scoreFabEl.textContent !== fabScore.toString()) {
    scoreFabEl.className = 'font-bold text-blue-600 animate-pulse';
    setTimeout(() => scoreFabEl.className = 'font-bold text-blue-600', 1000);
  }
  
  if (scoreDomeEl.textContent !== domeScore.toString()) {
    scoreDomeEl.className = 'font-bold text-green-600 animate-pulse';
    setTimeout(() => scoreDomeEl.className = 'font-bold text-green-600', 1000);
  }
  
  scoreFabEl.textContent = fabScore;
  scoreDomeEl.textContent = domeScore;

  renderIncoming();
  renderOutgoing();
  }
  catch(e) {
    console.error('Error rendering:', e);
  }
  }

const renderIncoming = () => {
  const incomingList = document.getElementById('incomingChecks');
  incomingList.innerHTML = '';

  const checks = getIncomingChecks(currentUser);
  
  if (checks.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'text-center p-4 text-gray-500 italic';
    emptyState.innerHTML = 'No incoming checks at the moment';
    incomingList.appendChild(emptyState);
    return;
  }
  
  checks.forEach(([id, sender, , message, sentAt]) => {
    const li = document.createElement('li');
    li.className = 'border p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex justify-between items-center bg-white hover:bg-indigo-50';
    li.style.animation = 'fadeIn 0.3s ease-in-out';

    const msgContainer = document.createElement('div');
    msgContainer.className = 'flex-grow';
    
    const senderEl = document.createElement('div');
    senderEl.className = 'font-medium text-indigo-700 mb-1';
    senderEl.textContent = `From ${sender}:`;
    
    const msgEl = document.createElement('div');
    msgEl.className = 'text-gray-700';
    msgEl.textContent = message || 'No message';
    
    const timeEl = document.createElement('div');
    timeEl.className = 'text-xs text-gray-500 mt-1';
    const sentDate = new Date(sentAt);
    timeEl.textContent = `Sent ${sentDate.toLocaleTimeString()}`;
    
    msgContainer.append(senderEl, msgEl, timeEl);

    const button = document.createElement('button');
    button.className = 'ml-4 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center shadow-sm hover:shadow';
    button.innerHTML = '<i class="fas fa-check mr-1"></i> Snooze';
    
    // Add ripple effect on click
    button.onclick = (e) => {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'absolute bg-white bg-opacity-30 rounded-full';
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size/2}px`;
      ripple.style.top = `${e.clientY - rect.top - size/2}px`;
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s linear';
      
      button.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
      
      // Process the snooze action
      snoozeCheck(id);
      
      // Show feedback
      const feedbackEl = document.createElement('div');
      feedbackEl.className = 'absolute inset-0 bg-green-600 flex items-center justify-center text-white rounded-lg';
      feedbackEl.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Snoozed!';
      button.appendChild(feedbackEl);
      
      // Animate the list item out
      li.style.animation = 'fadeOut 0.5s ease-in-out forwards';
      
      // Remove the item and render after animation
      setTimeout(() => {
        render();
      }, 500);
    };

    li.append(msgContainer, button);
    incomingList.appendChild(li);
  });
};

const renderOutgoing = () => {
  const outgoingList = document.getElementById('outgoingChecks');
  outgoingList.innerHTML = '';

  const checks = getOutgoingChecks(currentUser);
  
  if (checks.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'text-center p-4 text-gray-500 italic';
    emptyState.innerHTML = 'No outgoing checks at the moment';
    outgoingList.appendChild(emptyState);
    return;
  }
  
  checks.forEach(([id, , receiver, message, sentAt]) => {
    const li = document.createElement('li');
    li.className = 'border p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white hover:bg-blue-50';
    li.style.animation = 'fadeIn 0.3s ease-in-out';

    const elapsed = Math.floor((Date.now() - sentAt) / 1000);
    const remaining = 1800 - elapsed;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    
    // Calculate percentage for progress bar
    const percentRemaining = (remaining / 1800) * 100;
    
    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'mb-2';
    
    // Create receiver element
    const receiverEl = document.createElement('div');
    receiverEl.className = 'font-medium text-blue-700 mb-1';
    receiverEl.textContent = `To ${receiver}:`;
    
    // Create message element
    const msgEl = document.createElement('div');
    msgEl.className = 'text-gray-700';
    msgEl.textContent = message || 'No message';
    
    // Add elements to content container
    contentDiv.appendChild(receiverEl);
    contentDiv.appendChild(msgEl);
    
    // Create timer container
    const timerContainer = document.createElement('div');
    timerContainer.className = 'mt-2';
    
    // Create timer text
    const timerText = document.createElement('div');
    timerText.className = 'text-sm font-medium flex justify-between';
    
    // Create expiry text
    const expiryText = document.createElement('span');
    
    // Set color based on remaining time
    if (remaining < 300) { // less than 5 minutes
      expiryText.className = 'text-red-600';
    } else if (remaining < 600) { // less than 10 minutes
      expiryText.className = 'text-orange-600';
    } else {
      expiryText.className = 'text-gray-600';
    }
    
    expiryText.textContent = `Expires in: ${minutes}m ${seconds}s`;
    
    // Create sent time
    const sentTime = document.createElement('span');
    sentTime.className = 'text-gray-500';
    sentTime.textContent = new Date(sentAt).toLocaleTimeString();
    
    // Add timer elements
    timerText.appendChild(expiryText);
    timerText.appendChild(sentTime);
    timerContainer.appendChild(timerText);
    
    // Create progress bar container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'w-full bg-gray-200 rounded-full h-2.5 mt-1';
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = remaining < 300 ? 'bg-red-600 h-2.5 rounded-full' : 
                           remaining < 600 ? 'bg-orange-500 h-2.5 rounded-full' : 
                           'bg-blue-600 h-2.5 rounded-full';
    progressBar.style.width = `${percentRemaining}%`;
    
    // Add progress bar to container
    progressContainer.appendChild(progressBar);
    timerContainer.appendChild(progressContainer);
    
    // Add all elements to list item
    li.appendChild(contentDiv);
    li.appendChild(timerContainer);
    
    outgoingList.appendChild(li);
  });
};

const setupEvents = () => {
  document.getElementById('switchFab').addEventListener('click', () => {
    switchUser('Fab');
  });

  document.getElementById('switchDome').addEventListener('click', () => {
    switchUser('Dome');
  });

  document.getElementById('sendCheckBtn').addEventListener('click', () => {
    const sendBtn = document.getElementById('sendCheckBtn');
    const message = document.getElementById('checkMessage').value;
    const receiverId = OTHER_USER[currentUser];
    
    // Disable button and show loading state
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="animate-pulse">Sending...</span>';
    
    try {
      sendCheck(currentUser, receiverId, message);
      
      // Show success message
      const feedbackEl = document.createElement('div');
      feedbackEl.className = 'mt-4 p-3 bg-green-100 text-green-700 rounded-lg transition-all duration-500 ease-in-out';
      feedbackEl.innerHTML = `<i class="fas fa-check-circle mr-2"></i>Check sent successfully to ${receiverId}!`;
      
      const sendSection = document.querySelector('#sendCheckBtn').parentNode;
      sendSection.appendChild(feedbackEl);
      
      // Clear message field
      document.getElementById('checkMessage').value = '';
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        feedbackEl.style.opacity = '0';
        setTimeout(() => feedbackEl.remove(), 500);
      }, 3000);
    } catch (error) {
      // Show error message
      const feedbackEl = document.createElement('div');
      feedbackEl.className = 'mt-4 p-3 bg-red-100 text-red-700 rounded-lg';
      feedbackEl.textContent = error.message || 'Failed to send check';
      
      const sendSection = document.querySelector('#sendCheckBtn').parentNode;
      sendSection.appendChild(feedbackEl);
      
      // Remove error message after 3 seconds
      setTimeout(() => {
        feedbackEl.style.opacity = '0';
        setTimeout(() => feedbackEl.remove(), 500);
      }, 3000);
    } finally {
      // Re-enable button
      setTimeout(() => {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Invia Check';
      }, 1000);
    }
  });
};

const loopExpireChecks = () => {
  setInterval(() => {
    expireOldChecks();
    render();
  }, 10000); // check every 10 seconds
};

const init = async () => {
  try {
    // First initialize the database and wait for it to complete
    await initDatabase();
    // Then get the database reference
    window.db = getDb(); // quick ref
    setupEvents();
    render();
    loopExpireChecks();
  } catch (e) {
    console.error('Database initialization failed:', e);
    alert('Failed to initialize database. Please check console for details.');
  }
};

init();
