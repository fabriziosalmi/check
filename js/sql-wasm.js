// SQL.js module wrapper
export default function initSqlJs(config) {
  return new Promise((resolve, reject) => {
    // Load the wasm file
    const sqlWasmPath = config.locateFile('sql-wasm.wasm');
    
    // Dynamic import of the SQL module
    import('./sql.js')
      .then(SQL => {
        // Initialize SQL with the wasm file
        SQL.default(config).then(sql => {
          resolve(sql);
        }).catch(err => {
          reject(err);
        });
      })
      .catch(err => {
        reject(new Error(`Failed to load SQL.js module: ${err.message}`));
      });
  });
}
