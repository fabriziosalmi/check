import { v4 as uuidv4 } from 'uuid';

export const isSameDay = (a, b) => {
  const dateA = new Date(a).toISOString().split('T')[0];
  const dateB = new Date(b).toISOString().split('T')[0];
  return dateA === dateB;
};

export const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const uuid = () => uuidv4();
