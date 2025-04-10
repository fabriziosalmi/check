// Main application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Set up event listeners
    setupEventListeners();
});

function initApp() {
    console.log('CheckApp initialized');
    
    // Initialize SQL.js if needed
    initSql();
}

function setupEventListeners() {
    // File upload handling
    const fileUpload = document.getElementById('fileUpload');
    const dropZone = document.querySelector('.border-dashed');
    
    dropZone.addEventListener('click', function() {
        fileUpload.click();
    });
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('border-blue-500');
        this.classList.add('bg-blue-50');
    });
    
    dropZone.addEventListener('dragleave', function() {
        this.classList.remove('border-blue-500');
        this.classList.remove('bg-blue-50');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('border-blue-500');
        this.classList.remove('bg-blue-50');
        
        const files = e.dataTransfer.files;
        if (files.length) {
            fileUpload.files = files;
            handleFileUpload(files[0]);
        }
    });
    
    fileUpload.addEventListener('change', function(e) {
        if (this.files.length) {
            handleFileUpload(this.files[0]);
        }
    });
    
    // Analysis tool buttons
    document.getElementById('inspectBtn').addEventListener('click', function() {
        inspectData();
    });
    
    document.getElementById('visualizeBtn').addEventListener('click', function() {
        visualizeData();
    });
    
    document.getElementById('runQuery').addEventListener('click', function() {
        const query = document.getElementById('sqlQuery').value;
        if (query.trim()) {
            runSqlQuery(query);
        }
    });
}

function handleFileUpload(file) {
    const preview = document.getElementById('dataPreview');
    preview.innerHTML = `
        <div class="flex items-center justify-center h-full">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    `;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        let previewContent = '';
        
        // Detect file type and display appropriate preview
        if (file.type === 'application/json') {
            try {
                const json = JSON.parse(content);
                previewContent = `<pre class="text-xs overflow-auto max-h-[300px]">${JSON.stringify(json, null, 2)}</pre>`;
            } catch (err) {
                previewContent = `<p class="text-red-500">Error parsing JSON: ${err.message}</p>`;
            }
        } else if (file.type === 'text/csv') {
            const lines = content.split('\n').slice(0, 10);
            previewContent = `<div class="overflow-auto max-h-[300px]"><table class="w-full">`;
            
            lines.forEach((line, index) => {
                const cells = line.split(',');
                previewContent += '<tr>';
                cells.forEach(cell => {
                    if (index === 0) {
                        previewContent += `<th>${cell}</th>`;
                    } else {
                        previewContent += `<td>${cell}</td>`;
                    }
                });
                previewContent += '</tr>';
            });
            
            previewContent += `</table></div>`;
        } else {
            // Generic file preview
            previewContent = `
                <p class="font-medium">File: ${file.name}</p>
                <p>Size: ${(file.size / 1024).toFixed(2)} KB</p>
                <p>Type: ${file.type || 'Unknown'}</p>
                <p class="mt-4">Preview not available for this file type.</p>
            `;
        }
        
        preview.innerHTML = previewContent;
    };
    
    reader.readAsText(file);
}

function inspectData() {
    alert('Data inspection functionality will be implemented here.');
}

function visualizeData() {
    alert('Data visualization functionality will be implemented here.');
}

function runSqlQuery(query) {
    const resultsDiv = document.getElementById('queryResults');
    resultsDiv.innerHTML = '<p>Executing query...</p>';
    
    // This is a placeholder. In a real app, this would use the SQL.js library
    setTimeout(() => {
        resultsDiv.innerHTML = `
            <h4 class="font-medium mb-2">Query Results</h4>
            <div class="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Example</td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>Test</td>
                            <td>200</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>Sample</td>
                            <td>300</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }, 1000);
}

function initSql() {
    // Placeholder for SQL.js initialization
    console.log('SQL.js would be initialized here');
}
