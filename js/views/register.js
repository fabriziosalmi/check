export class RegisterView {
  constructor(props) {
    this.props = props || {};
  }
  
  render() {
    const container = document.createElement('div');
    container.className = 'flex justify-center items-center py-12';
    
    container.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
        
        <div id="register-error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded hidden"></div>
        
        <form id="register-form" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="John Doe"
            />
          </div>
          
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
          
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          
          <div class="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-700">
              I agree to the <a href="#" class="text-primary hover:text-primary/90">Terms of Service</a> and <a href="#" class="text-primary hover:text-primary/90">Privacy Policy</a>
            </label>
          </div>
          
          <div>
            <button
              type="submit"
              id="register-button"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign up
            </button>
            <div id="register-loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hidden">
              <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Creating account...
            </div>
          </div>
        </form>
        
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600">
            Already have an account?
            <a href="/login" class="text-primary hover:text-primary/90 font-medium">
              Log in
            </a>
          </p>
        </div>
      </div>
    `;
    
    // Add event listeners after the form is added to DOM
    setTimeout(() => {
      const form = container.querySelector('#register-form');
      const errorDiv = container.querySelector('#register-error');
      const registerButton = container.querySelector('#register-button');
      const registerLoading = container.querySelector('#register-loading');
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
        const name = form.querySelector('#name').value;
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        const confirmPassword = form.querySelector('#confirm-password').value;
        const terms = form.querySelector('#terms').checked;
        
        // Reset error state
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
        
        // Validate passwords match
        if (password !== confirmPassword) {
          errorDiv.textContent = 'Passwords do not match';
          errorDiv.classList.remove('hidden');
          return;
        }
        
        // Validate terms
        if (!terms) {
          errorDiv.textContent = 'You must agree to the terms and conditions';
          errorDiv.classList.remove('hidden');
          return;
        }
        
        // Show loading state
        registerButton.classList.add('hidden');
        registerLoading.classList.remove('hidden');
        
        try {
          // Submit registration data
          if (this.props.onRegister) {
            await this.props.onRegister({ name, email, password });
          }
        } catch (error) {
          // Show error message
          errorDiv.textContent = error.message || 'Registration failed';
          errorDiv.classList.remove('hidden');
          
          // Reset loading state
          registerButton.classList.remove('hidden');
          registerLoading.classList.add('hidden');
        }
      });
    }, 0);
    
    return container;
  }
}
