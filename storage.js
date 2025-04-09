const STORAGE_KEY = 'checkmate_db';

export const saveToStorage = (db) => {
  const binaryArray = db.export(); // Uint8Array
  const base64 = btoa(String.fromCharCode(...binaryArray));
  localStorage.setItem(STORAGE_KEY, base64);
};

export const loadFromStorage = async (initSqlJs) => {
  const base64 = localStorage.getItem(STORAGE_KEY);
  if (!base64) return null;

  const binaryStr = atob(base64);
  const binaryArray = Uint8Array.from(binaryStr, char => char.charCodeAt(0));
  const SQL = await initSqlJs({ locateFile: file => `sql-wasm.wasm` });
  return new SQL.Database(binaryArray);
};

export const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};
