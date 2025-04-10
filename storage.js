const STORAGE_KEY = 'checkmate_db';

export const saveToStorage = (db) => {
  const binaryArray = db.export(); // Uint8Array
  const base64 = btoa(String.fromCharCode(...binaryArray));
  localStorage.setItem(STORAGE_KEY, base64);
};

export const loadFromStorage = async (initSqlJs) => {
  const base64 = localStorage.getItem(STORAGE_KEY);
  if (!base64) return null;

  try {
    const binaryStr = atob(base64);
    const binaryArray = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      binaryArray[i] = binaryStr.charCodeAt(i);
    }
    const SQL = await initSqlJs({ locateFile: file => `/${file}` });
    return new SQL.Database(binaryArray);
  } catch (error) {
    console.error('Error loading database from storage:', error);
    clearStorage();
    return null;
  }
};

export const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};
