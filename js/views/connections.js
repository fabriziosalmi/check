export class ConnectionsView {
  constructor(props) {
    this.props = props || {};
    this.searchTerm = '';
    this.filterActive = 'all'; // 'all', 'active', 'inactive'
  }
  
  render() {
    const { connections = [] } = this.props;
    
    const container = document.createElement('div');
    container.className = 'space-y-6';
    
    // Header section
    const header = document.createElement('div');
    header.className = 'pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between';
    header.innerHTML = `
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
        Connections
      </h2>
      <div class="mt-3 flex sm:mt-0">
        <button 
          id="add-connection-button"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Connection
        </button>
      </div>
    `;
    container.appendChild(header);
    
    // Filter and search section
    const filterSection = document.createElement('div');
    filterSection.className = 'flex flex-col md:flex-row md:items-center md:justify-between gap-4';
    filterSection.innerHTML = `
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          id="search-input"
          type="text"
          placeholder="Search connections..."
          class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-700">Filter:</span>
        <div class="flex rounded-md shadow-sm">
          <button
            id="filter-all"
            class="px-4 py-2 text-sm font-medium bg-primary text-white border border-gray-300 rounded-l-md"
          >
            All
          </button>
          <button
            id="filter-active"
            class="px-4 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border-t border-b border-gray-300"
          >
            Active
          </button>
          <button
            id="filter-inactive"
            class="px-4 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-r-md"
          >
            Inactive
          </button>
        </div>
      </div>
    `;
    container.appendChild(filterSection);
    
    // Connection list container
    const connectionListContainer = document.createElement('div');
    connectionListContainer.id = 'connection-list';
    connectionListContainer.className = 'mt-6';
    
    // Initial render of connections
    this.renderConnectionList(connectionListContainer, connections);
    container.appendChild(connectionListContainer);
    
    // Add connection form modal
    const addConnectionModal = document.createElement('div');
    addConnectionModal.id = 'add-connection-modal';
    addConnectionModal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 hidden';
    addConnectionModal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Connection</h3>
        
        <div id="add-connection-error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded hidden"></div>
        
        <form id="add-connection-form" class="space-y-4">
          <div>
            <label for="connection-name" class="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="connection-name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label for="connection-email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="connection-email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              id="cancel-add-connection"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
            >
              Add Connection
            </button>
          </div>
        </form>
      </div>
    `;
    container.appendChild(addConnectionModal);
    
    // Add event listeners after container is added to DOM
    setTimeout(() => {
      // Search functionality
      const searchInput = container.querySelector('#search-input');
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.renderConnectionList(
          container.querySelector('#connection-list'),
          connections
        );
      });
      
      // Filter buttons
      const filterAll = container.querySelector('#filter-all');
      const filterActive = container.querySelector('#filter-active');
      const filterInactive = container.querySelector('#filter-inactive');
      
      filterAll.addEventListener('click', () => {
        this.filterActive = 'all';
        this.updateFilterButtons(filterAll, filterActive, filterInactive);
        this.renderConnectionList(
          container.querySelector('#connection-list'),
          connections
        );
      });
      
      filterActive.addEventListener('click', () => {
        this.filterActive = 'active';
        this.updateFilterButtons(filterAll, filterActive, filterInactive);
        this.renderConnectionList(
          container.querySelector('#connection-list'),
          connections
        );
      });
      
      filterInactive.addEventListener('click', () => {
        this.filterActive = 'inactive';
        this.updateFilterButtons(filterAll, filterActive, filterInactive);
        this.renderConnectionList(
          container.querySelector('#connection-list'),
          connections
        );
      });
      
      // Add connection button
      const addConnectionButton = container.querySelector('#add-connection-button');
      const addConnectionModal = container.querySelector('#add-connection-modal');
      
      addConnectionButton.addEventListener('click', () => {
        addConnectionModal.classList.remove('hidden');
      });
      
      // Cancel add connection
      const cancelAddConnection = container.querySelector('#cancel-add-connection');
      
      cancelAddConnection.addEventListener('click', () => {
        addConnectionModal.classList.add('hidden');
        container.querySelector('#add-connection-form').reset();
        container.querySelector('#add-connection-error').classList.add('hidden');
      });
      
      // Close modal when clicking outside
      addConnectionModal.addEventListener('click', (e) => {
        if (e.target === addConnectionModal) {
          addConnectionModal.classList.add('hidden');
          container.querySelector('#add-connection-form').reset();
          container.querySelector('#add-connection-error').classList.add('hidden');
        }
      });
      
      // Submit add connection form
      const addConnectionForm = container.querySelector('#add-connection-form');
      const addConnectionError = container.querySelector('#add-connection-error');
      
      addConnectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = addConnectionForm.querySelector('#connection-name').value;
        const email = addConnectionForm.querySelector('#connection-email').value;
        
        addConnectionError.classList.add('hidden');
        
        try {
          if (this.props.onAddConnection) {
            await this.props.onAddConnection({ name, email });
            addConnectionModal.classList.add('hidden');
            addConnectionForm.reset();
          }
        } catch (error) {
          addConnectionError.textContent = error.message || 'Failed to add connection';
          addConnectionError.classList.remove('hidden');
        }
      });
    }, 0);
    
    return container;
  }
  
  renderConnectionList(container, connections) {
    // Apply filters
    const filteredConnections = connections.filter(connection => {
      const matchesSearch = 
        connection.name?.toLowerCase().includes(this.searchTerm) || 
        connection.email.toLowerCase().includes(this.searchTerm);
      
      if (this.filterActive === 'all') return matchesSearch;
      if (this.filterActive === 'active') return matchesSearch && connection.isActive;
      if (this.filterActive === 'inactive') return matchesSearch && !connection.isActive;
      
      return matchesSearch;
    });
    
    // Clear container
    container.innerHTML = '';
    
    if (filteredConnections.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'text-center py-12 bg-white rounded-lg shadow';
      emptyState.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">No connections found</h3>
        <p class="mt-1 text-sm text-gray-500">
          ${this.searchTerm 
            ? `No connections matching "${this.searchTerm}"`
            : 'Get started by adding your first connection'}
        </p>
      `;
      container.appendChild(emptyState);
    } else {
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      
      filteredConnections.forEach(connection => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow p-6 transition-all hover:shadow-md';
        card.innerHTML = `
          <div class="flex justify-between items-start">
            <div class="flex items-center space-x-4">
              <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span class="text-lg font-medium text-primary">
                  ${connection.name ? connection.name[0].toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">${connection.name || 'Unnamed'}</h3>
                <p class="text-sm text-gray-500">${connection.email}</p>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button
                class="message-button text-sm px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                data-id="${connection.id}"
              >
                Message
              </button>
              <button
                class="delete-button text-sm px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                data-id="${connection.id}"
              >
                Remove
              </button>
            </div>
          </div>
          
          <div class="message-form hidden mt-4 space-y-3" data-id="${connection.id}">
            <textarea
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              rows="3"
              placeholder="Write your message..."
            ></textarea>
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                class="cancel-message px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                data-id="${connection.id}"
              >
                Cancel
              </button>
              <button
                type="button"
                class="send-message px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
                data-id="${connection.id}"
              >
                Send Message
              </button>
            </div>
          </div>
          
          <div class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Connection Status</h4>
            <div class="flex items-center space-x-2">
              <span class="h-2 w-2 rounded-full ${connection.isActive ? 'bg-green-500' : 'bg-gray-400'}"></span>
              <span class="text-sm text-gray-600">${connection.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500">
              Connected since ${new Date(connection.connectedSince).toLocaleDateString()}
            </p>
          </div>
        `;
        
        grid.appendChild(card);
      });
      
      container.appendChild(grid);
      
      // Add event listeners to buttons
      const messageButtons = container.querySelectorAll('.message-button');
      const deleteButtons = container.querySelectorAll('.delete-button');
      const cancelMessageButtons = container.querySelectorAll('.cancel-message');
      const sendMessageButtons = container.querySelectorAll('.send-message');
      
      messageButtons.forEach(button => {
        button.addEventListener('click', () => {
          const connectionId = button.getAttribute('data-id');
          const messageForm = container.querySelector(`.message-form[data-id="${connectionId}"]`);
          messageForm.classList.toggle('hidden');
        });
      });
      
      cancelMessageButtons.forEach(button => {
        button.addEventListener('click', () => {
          const connectionId = button.getAttribute('data-id');
          const messageForm = container.querySelector(`.message-form[data-id="${connectionId}"]`);
          messageForm.classList.add('hidden');
          messageForm.querySelector('textarea').value = '';
        });
      });
      
      sendMessageButtons.forEach(button => {
        button.addEventListener('click', async () => {
          const connectionId = button.getAttribute('data-id');
          const messageForm = container.querySelector(`.message-form[data-id="${connectionId}"]`);
          const messageText = messageForm.querySelector('textarea').value.trim();
          
          if (messageText && this.props.onSendMessage) {
            await this.props.onSendMessage(connectionId, messageText);
            messageForm.classList.add('hidden');
            messageForm.querySelector('textarea').value = '';
          }
        });
      });
      
      deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
          const connectionId = button.getAttribute('data-id');
          if (confirm('Are you sure you want to remove this connection?')) {
            if (this.props.onDeleteConnection) {
              await this.props.onDeleteConnection(connectionId);
            }
          }
        });
      });
    }
  }
  
  updateFilterButtons(filterAll, filterActive, filterInactive) {
    // Reset all buttons
    [filterAll, filterActive, filterInactive].forEach(button => {
      button.classList.remove('bg-primary', 'text-white');
      button.classList.add('bg-white', 'text-gray-700', 'hover:bg-gray-50');
    });
    
    // Set active button
    if (this.filterActive === 'all') {
      filterAll.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gray-50');
      filterAll.classList.add('bg-primary', 'text-white');
    } else if (this.filterActive === 'active') {
      filterActive.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gray-50');
      filterActive.classList.add('bg-primary', 'text-white');
    } else if (this.filterActive === 'inactive') {
      filterInactive.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gray-50');
      filterInactive.classList.add('bg-primary', 'text-white');
    }
  }
}
