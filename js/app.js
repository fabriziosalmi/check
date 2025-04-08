import { AuthManager } from './auth.js';
import { HeaderComponent } from './components/header.js';
import { Router } from './router.js';
import { ConnectionManager } from './connectionManager.js';
import { DashboardView } from './views/dashboard.js';
import { ConnectionsView } from './views/connections.js';
import { SettingsView } from './views/settings.js';
import { LoginView } from './views/login.js';
import { RegisterView } from './views/register.js';
import { NotificationManager } from './notification.js';

// Initialize the application
class App {
  constructor() {
    this.auth = new AuthManager();
    this.connectionManager = new ConnectionManager();
    this.notification = new NotificationManager();
    
    // Initialize components
    this.header = new HeaderComponent(document.getElementById('header'), {
      user: this.auth.getCurrentUser(),
      onLogout: () => this.handleLogout()
    });
    
    // Initialize router
    this.router = new Router();
    this.registerRoutes();
    
    // Render initial view
    this.header.render();
    this.router.navigate(window.location.pathname);
    
    // Remove loading indicator
    document.getElementById('loading').style.display = 'none';
  }
  
  registerRoutes() {
    // Public routes
    this.router.addRoute('/', () => {
      if (this.auth.isAuthenticated()) {
        this.router.navigate('/dashboard');
      } else {
        this.renderView(new LoginView({
          onLogin: (email, password) => this.handleLogin(email, password)
        }));
      }
    });
    
    this.router.addRoute('/login', () => {
      this.renderView(new LoginView({
        onLogin: (email, password) => this.handleLogin(email, password)
      }));
    });
    
    this.router.addRoute('/register', () => {
      this.renderView(new RegisterView({
        onRegister: (user) => this.handleRegister(user)
      }));
    });
    
    // Protected routes
    this.router.addRoute('/dashboard', () => {
      this.checkAuth(() => {
        this.renderView(new DashboardView({
          user: this.auth.getCurrentUser(),
          connections: this.connectionManager.getActiveConnections()
        }));
      });
    });
    
    this.router.addRoute('/connections', () => {
      this.checkAuth(() => {
        this.renderView(new ConnectionsView({
          connections: this.connectionManager.getActiveConnections(),
          onSendMessage: (connectionId, message) => this.handleSendMessage(connectionId, message),
          onDeleteConnection: (connectionId) => this.handleDeleteConnection(connectionId),
          onAddConnection: (connection) => this.handleAddConnection(connection)
        }));
      });
    });
    
    this.router.addRoute('/settings', () => {
      this.checkAuth(() => {
        this.renderView(new SettingsView({
          user: this.auth.getCurrentUser(),
          onUpdateUser: (userData) => this.handleUpdateUser(userData)
        }));
      });
    });
    
    // 404 route
    this.router.setNotFoundHandler(() => {
      const content = document.getElementById('content');
      content.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16">
          <h1 class="text-5xl font-bold text-gray-900 mb-4">404</h1>
          <p class="text-xl text-gray-600 mb-8">Page not found</p>
          <a href="/" class="btn btn-primary">Go to Home</a>
        </div>
      `;
    });
  }
  
  renderView(view) {
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.appendChild(view.render());
  }
  
  checkAuth(callback) {
    if (this.auth.isAuthenticated()) {
      callback();
    } else {
      this.notification.show('You need to login first', 'warning');
      this.router.navigate('/login');
    }
  }
  
  // Auth handlers
  async handleLogin(email, password) {
    try {
      await this.auth.login(email, password);
      this.notification.show('Successfully logged in!', 'success');
      this.header.update({ user: this.auth.getCurrentUser() });
      this.router.navigate('/dashboard');
    } catch (error) {
      this.notification.show(error.message, 'error');
    }
  }
  
  async handleLogout() {
    try {
      await this.auth.logout();
      this.notification.show('Successfully logged out!', 'success');
      this.header.update({ user: null });
      this.router.navigate('/login');
    } catch (error) {
      this.notification.show(error.message, 'error');
    }
  }
  
  async handleRegister(userData) {
    try {
      await this.auth.register(userData);
      this.notification.show('Registration successful! Please log in.', 'success');
      this.router.navigate('/login');
    } catch (error) {
      this.notification.show(error.message, 'error');
    }
  }
  
  // User handlers
  async handleUpdateUser(userData) {
    try {
      const updatedUser = await this.auth.updateUser(userData);
      this.notification.show('Profile updated successfully!', 'success');
      this.header.update({ user: updatedUser });
    } catch (error) {
      this.notification.show(error.message, 'error');
    }
  }
  
  // Connection handlers
  handleSendMessage(connectionId, message) {
    try {
      this.connectionManager.sendMessage(connectionId, message);
      this.notification.show('Message sent!', 'success');
    } catch (error) {
      this.notification.show(error.message, 'error');
    }
  }
  
  handleDeleteConnection(connectionId) {
    try {
      this.connectionManager.deleteConnection(connectionId);
      this.notification.show('Connection removed', 'success');
      // Re-render current view if on connections page
      if (window.location.pathname === '/connections') {
        this.router.navigate('/connections');
      }
    } catch (error) {
      this.notification.show(error.message, 'error');
    }
  }
  
  handleAddConnection(connection) {
    try {
      this.connectionManager.saveConnection(connection);
      this.notification.show('Connection added!', 'success');
      this.router.navigate('/connections');
    } catch (error) {
      this.notification.show(error.message, 'error');
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
