// SQL.js initialization without ES modules
var initSqlJs = (function() {
    // Create a function that will be globally available
    return function(config) {
        config = config || {};
        
        // Default configuration
        var sqlConfig = {
            locateFile: config.locateFile || function(file) {
                return './' + file;
            }
        };
        
        // Return a promise that will resolve with the SQL.js instance
        return new Promise(function(resolve, reject) {
            // Load the SQL.js script
            var script = document.createElement('script');
            script.src = './js/sql.js';
            script.onload = function() {
                // Once loaded, initialize SQL.js
                if (typeof SQL !== 'undefined') {
                    try {
                        // Initialize SQL with the configuration
                        var sql = SQL(sqlConfig);
                        resolve(sql);
                    } catch(e) {
                        reject(e);
                    }
                } else {
                    reject(new Error('SQL.js was not properly loaded'));
                }
            };
            script.onerror = function() {
                reject(new Error('Failed to load SQL.js'));
            };
            
            // Add the script to the document
            document.head.appendChild(script);
        });
    };
})();
