export class LoginView {
  constructor(props) {
    this.props = props || {};
  }
  
  render() {
    const container = document.createElement('div');
    container.className = 'flex justify-center items-center py-12';
    
    container.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Log In</h2>
        
        <div id="login-error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded hidden"></div>
        
        <form id="login-form" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label for="remember_me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div class="text-sm">
              <a href="#" class="text-primary hover:text-primary/90">
                Forgot password?
              </a>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              id="login-button"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign in
            </button>
            <div id="login-loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hidden">
              <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Signing in...
            </div>
          </div>
        </form>
        
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <a href="/register" class="text-primary hover:text-primary/90 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    `;
    
    // Add event listeners after the form is added to DOM
    setTimeout(() => {
      const form = container.querySelector('#login-form');
      const errorDiv = container.querySelector('#login-error');
      const loginButton = container.querySelector('#login-button');
      const loginLoading = container.querySelector('#login-loading');
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        
        // Reset error state
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
        
        // Show loading state
        loginButton.classList.add('hidden');
        loginLoading.classList.remove('hidden');
        
        try {
          // Submit login data
          if (this.props.onLogin) {
            await this.props.onLogin(email, password);
          }
        } catch (error) {
          // Show error message
          errorDiv.textContent = error.message || 'Login failed';
          errorDiv.classList.remove('hidden');
          
          // Reset loading state
          loginButton.classList.remove('hidden');
          loginLoading.classList.add('hidden');
        }
      });
    }, 0);
    
    return container;
  }
}
