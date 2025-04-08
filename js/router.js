export class Router {
  constructor() {
    this.routes = {};
    this.notFoundHandler = () => {
      console.error('Page not found');
    };
    
    // Handle navigation
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname);
    });
    
    // Intercept link clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (target && target.getAttribute('href').startsWith('/')) {
        e.preventDefault();
        this.navigate(target.getAttribute('href'));
      }
    });
  }
  
  // Add a route handler
  addRoute(path, handler) {
    this.routes[path] = handler;
  }
  
  // Set 404 handler
  setNotFoundHandler(handler) {
    this.notFoundHandler = handler;
  }
  
  // Navigate to a path
  navigate(path) {
    // Update browser history
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    
    // Find and execute the route handler
    const handler = this.routes[path];
    if (handler) {
      handler();
    } else {
      this.notFoundHandler();
    }
  }
}
