export class DashboardView {
  constructor(props) {
    this.props = props || {};
  }
  
  render() {
    const { user, connections = [] } = this.props;
    
    // Create container element
    const container = document.createElement('div');
    container.className = 'space-y-8';
    
    // Dashboard header
    const header = document.createElement('div');
    header.className = 'pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between';
    header.innerHTML = `
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
        Dashboard
      </h2>
      <div class="mt-3 flex sm:mt-0">
        <a href="/connections" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Connection
        </a>
      </div>
    `;
    container.appendChild(header);
    
    // Stats section
    const statsSection = document.createElement('div');
    statsSection.className = 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3';
    
    // Calculate stats
    const activeConnections = connections.filter(c => c.isActive).length;
    
    statsSection.innerHTML = `
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">
            Total Connections
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            ${connections.length}
          </dd>
        </div>
      </div>
      
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">
            Active Connections
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            ${activeConnections}
          </dd>
        </div>
      </div>
      
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">
            Connection Rate
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            ${connections.length ? Math.round((activeConnections / connections.length) * 100) : 0}%
          </dd>
        </div>
      </div>
    `;
    container.appendChild(statsSection);
    
    // Recent connections section
    const recentConnectionsSection = document.createElement('div');
    recentConnectionsSection.className = 'bg-white shadow overflow-hidden sm:rounded-md';
    
    const recentConnections = [...connections]
      .sort((a, b) => new Date(b.connectedSince) - new Date(a.connectedSince))
      .slice(0, 5);
    
    let recentConnectionsHTML = `
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Recent Connections
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Your most recent connections
        </p>
      </div>
    `;
    
    if (recentConnections.length === 0) {
      recentConnectionsHTML += `
        <div class="px-4 py-5 sm:p-6 text-center">
          <p class="text-gray-500">No connections yet. <a href="/connections" class="text-primary hover:text-primary/90">Add your first connection</a></p>
        </div>
      `;
    } else {
      recentConnectionsHTML += `
        <ul class="divide-y divide-gray-200">
          ${recentConnections.map(connection => `
            <li>
              <a href="/connections" class="block hover:bg-gray-50">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-primary truncate">
                      ${connection.name || connection.email}
                    </p>
                    <div class="ml-2 flex-shrink-0 flex">
                      <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${connection.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${connection.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 flex justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        ${connection.email}
                      </p>
                    </div>
                    <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                      </svg>
                      Connected on ${new Date(connection.connectedSince).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </a>
            </li>
          `).join('')}
        </ul>
      `;
    }
    
    recentConnectionsSection.innerHTML = recentConnectionsHTML;
    container.appendChild(recentConnectionsSection);
    
    return container;
  }
}
