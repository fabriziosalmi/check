export const formatRemainingTime = (msRemaining) => {
    if (msRemaining <= 0) return 'Expired';
  
    const minutes = Math.floor(msRemaining / 60000);
    const seconds = Math.floor((msRemaining % 60000) / 1000);
  
    return `${minutes}m ${seconds}s`;
  };
  
  export const getRemainingTime = (sentAt, limitMs = 1800000) => {
    const now = Date.now();
    return Math.max(0, limitMs - (now - sentAt));
  };
  
  export const isExpired = (sentAt, limitMs = 1800000) => {
    return Date.now() - sentAt > limitMs;
  };
  