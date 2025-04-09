import { getDb } from './db-init.js';
import { v4 as uuidv4 } from 'uuid';

const DAILY_LIMIT = 3;
const CHECK_EXPIRY_MS = 30 * 60 * 1000;

export const sendCheck = (senderId, receiverId, message) => {
  const db = getDb();

  const today = new Date().toISOString().split('T')[0];
  const sender = db.exec(`SELECT * FROM users WHERE id = ?`, [senderId])[0];
  const sentToday = sender.values[0][3];
  const lastDate = sender.values[0][4];

  if (lastDate === today && sentToday >= DAILY_LIMIT) {
    throw new Error('Daily check limit reached.');
  }

  const pending = db.exec(`
    SELECT * FROM checks
    WHERE sender = ? AND receiver = ? AND snoozed_at IS NULL AND expired = 0
  `, [senderId, receiverId]);

  if (pending.length > 0) {
    throw new Error('Pending check already exists.');
  }

  const checkId = uuidv4();
  const timestamp = Date.now();

  db.run(`
    INSERT INTO checks (id, sender, receiver, message, sent_at)
    VALUES (?, ?, ?, ?, ?)
  `, [checkId, senderId, receiverId, message, timestamp]);

  const updatedCount = (lastDate === today) ? sentToday + 1 : 1;

  db.run(`
    UPDATE users
    SET daily_sent = ?, last_sent_date = ?
    WHERE id = ?
  `, [updatedCount, today, senderId]);

  return checkId;
};

export const getIncomingChecks = (userId) => {
  const db = getDb();
  return db.exec(`
    SELECT * FROM checks
    WHERE receiver = ? AND snoozed_at IS NULL AND expired = 0
  `, [userId])[0]?.values || [];
};

export const getOutgoingChecks = (userId) => {
  const db = getDb();
  return db.exec(`
    SELECT * FROM checks
    WHERE sender = ? AND snoozed_at IS NULL AND expired = 0
  `, [userId])[0]?.values || [];
};

export const snoozeCheck = (checkId) => {
  const db = getDb();

  const checkRes = db.exec(`SELECT * FROM checks WHERE id = ?`, [checkId]);
  if (!checkRes.length) return;

  const [id, sender, receiver] = checkRes[0].values[0];

  db.run(`
    UPDATE checks
    SET snoozed_at = ?
    WHERE id = ?
  `, [Date.now(), checkId]);

  db.run(`UPDATE users SET score = score + 1 WHERE id = ?`, [sender]);
  db.run(`UPDATE users SET score = score + 2 WHERE id = ?`, [receiver]);
};

export const expireOldChecks = () => {
  const db = getDb();

  const now = Date.now();
  const checks = db.exec(`
    SELECT id, sender, sent_at FROM checks
    WHERE snoozed_at IS NULL AND expired = 0
  `)[0]?.values || [];

  checks.forEach(([id, sender, sentAt]) => {
    if (now - sentAt > CHECK_EXPIRY_MS) {
      db.run(`UPDATE checks SET expired = 1 WHERE id = ?`, [id]);
      db.run(`UPDATE users SET score = score + 1 WHERE id = ?`, [sender]);
    }
  });
};
