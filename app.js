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

const render = () => {
  document.getElementById('currentUser').textContent = currentUser;

  const db = window.db;

  const userRes = db.exec(`SELECT * FROM users WHERE id = ?`, [currentUser])[0];
  const fabScore = db.exec(`SELECT score FROM users WHERE id = 'fab'`)[0].values[0][0];
  const domeScore = db.exec(`SELECT score FROM users WHERE id = 'dome'`)[0].values[0][0];

  const remaining = userRes.values[0][3];
  const lastDate = userRes.values[0][4];
  const today = new Date().toISOString().split('T')[0];
  const checksLeft = lastDate === today ? 3 - remaining : 3;

  document.getElementById('remainingChecks').textContent = checksLeft;
  document.getElementById('scoreFab').textContent = fabScore;
  document.getElementById('scoreDome').textContent = domeScore;

  renderIncoming();
  renderOutgoing();
};

const renderIncoming = () => {
  const incomingList = document.getElementById('incomingChecks');
  incomingList.innerHTML = '';

  const checks = getIncomingChecks(currentUser);
  checks.forEach(([id, sender, , message, sentAt]) => {
    const li = document.createElement('li');
    li.className = 'border p-2 rounded shadow flex justify-between items-center';

    const msg = document.createElement('div');
    msg.innerHTML = `<strong>From ${sender}:</strong> ${message || 'No message'}`;

    const button = document.createElement('button');
    button.className = 'ml-4 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600';
    button.textContent = 'Snooze';
    button.onclick = () => {
      snoozeCheck(id);
      render();
    };

    li.append(msg, button);
    incomingList.appendChild(li);
  });
};

const renderOutgoing = () => {
  const outgoingList = document.getElementById('outgoingChecks');
  outgoingList.innerHTML = '';

  const checks = getOutgoingChecks(currentUser);
  checks.forEach(([id, , receiver, message, sentAt]) => {
    const li = document.createElement('li');
    li.className = 'border p-2 rounded shadow';

    const elapsed = Math.floor((Date.now() - sentAt) / 1000);
    const remaining = 1800 - elapsed;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    li.innerHTML = `
      <strong>To ${receiver}:</strong> ${message || 'No message'}<br/>
      <span class="text-sm text-gray-500">Expires in: ${minutes}m ${seconds}s</span>
    `;

    outgoingList.appendChild(li);
  });
};

const setupEvents = () => {
  document.getElementById('switchFab').onclick = () => {
    currentUser = 'fab';
    render();
  };

  document.getElementById('switchDome').onclick = () => {
    currentUser = 'dome';
    render();
  };

  document.getElementById('sendCheckBtn').onclick = () => {
    const msg = document.getElementById('checkMessage').value;
    try {
      sendCheck(currentUser, OTHER_USER[currentUser], msg);
      document.getElementById('checkMessage').value = '';
      render();
    } catch (e) {
      alert(e.message);
    }
  };
};

const loopExpireChecks = () => {
  setInterval(() => {
    expireOldChecks();
    render();
  }, 10000); // check every 10 seconds
};

const init = async () => {
  try {
    await initDatabase();
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
