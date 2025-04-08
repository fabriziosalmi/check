export class HeaderComponent {
  constructor(element, props) {
    this.element = element;
    this.props = props || {};
  }
  
  update(props) {
    this.props = { ...this.props, ...props };
    this.render();
  }
  
  render() {
    const { user, onLogout } = this.props;
    
    this.element.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a href="/" class="text-2xl font-bold text-primary">
                ConnectApp
              </a>
            </div>
            
            <nav class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="/dashboard" 
                class="${
                  window.location.pathname === '/dashboard'
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </a>
              
              <a href="/connections" 
                class="${
                  window.location.pathname === '/connections'
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Connections
              </a>
              
              <a href="/settings" 
                class="${
                  window.location.pathname === '/settings'
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Settings
              </a>
            </nav>
          </div>
          
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            ${user ? `
              <div class="ml-3 relative flex items-center space-x-4">
                <span class="text-sm font-medium text-gray-700">
                  Hello, ${user.name || user.email}
                </span>
                <button
                  id="logout-button"
                  class="px-4 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Logout
                </button>
              </div>
            ` : `
              <div class="space-x-2">
                <a href="/login" class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                  Log in
                </a>
                <a href="/register" class="px-4 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-secondary/90 transition-colors">
                  Sign up
                </a>
              </div>
            `}
          </div>
          
          <div class="flex items-center sm:hidden">
            <button
              id="mobile-menu-button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span class="sr-only">Open menu</span>
              <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile menu, hidden by default -->
      <div id="mobile-menu" class="sm:hidden hidden">
        <div class="pt-2 pb-3 space-y-1">
          <a href="/dashboard"
            class="${
              window.location.pathname === '/dashboard'
                ? 'bg-primary-50 border-primary text-primary'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Dashboard
          </a>
          
          <a href="/connections"
            class="${
              window.location.pathname === '/connections'
                ? 'bg-primary-50 border-primary text-primary'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Connections
          </a>
          
          <a href="/settings"
            class="${
              window.location.pathname === '/settings'
                ? 'bg-primary-50 border-primary text-primary'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Settings
          </a>
        </div>
        
        ${user ? `
          <div class="pt-4 pb-3 border-t border-gray-200">
            <div class="flex items-center px-4">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span class="text-lg font-medium text-gray-600">
                    ${user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div class="ml-3">
                <div class="text-base font-medium text-gray-800">${user.name || ''}</div>
                <div class="text-sm font-medium text-gray-500">${user.email}</div>
              </div>
            </div>
            <div class="mt-3 space-y-1">
              <button
                id="mobile-logout-button"
                class="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        ` : `
          <div class="pt-4 pb-3 border-t border-gray-200">
            <div class="space-y-1 px-4">
              <a href="/login" 
                class="block text-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
                Log in
              </a>
              <a href="/register"
                class="block mt-2 text-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary/90">
                Sign up
              </a>
            </div>
          </div>
        `}
      </div>
    `;
    
    // Add event listeners
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton) {
      mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton && onLogout) {
      logoutButton.addEventListener('click', onLogout);
    }
    
    const mobileLogoutButton = document.getElementById('mobile-logout-button');
    if (mobileLogoutButton && onLogout) {
      mobileLogoutButton.addEventListener('click', onLogout);
    }
    
    return this.element;
  }
}
