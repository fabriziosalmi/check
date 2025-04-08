export class AuthManager {
  constructor() {
    this.SESSION_TOKEN_KEY = 'user_session_token';
    this.SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  }
  
  // Get the current user from the session token
  getCurrentUser() {
    const token = localStorage.getItem(this.SESSION_TOKEN_KEY);
    if (!token) return null;
    
    try {
      const data = JSON.parse(atob(token.split('.')[1]));
      if (data.exp * 1000 < Date.now()) {
        localStorage.removeItem(this.SESSION_TOKEN_KEY);
        return null;
      }
      return data.user;
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem(this.SESSION_TOKEN_KEY);
      return null;
    }
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getCurrentUser();
  }
  
  // Login user
  async login(email, password) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const user = {
            id: `user_${Date.now()}`,
            email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
          };
          
          const token = this.createSessionToken(user);
          localStorage.setItem(this.SESSION_TOKEN_KEY, token);
          
          resolve(user);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  }
  
  // Register a new user
  async register(userData) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email && userData.password && userData.name) {
          // In a real application, check if user exists first
          const user = {
            id: `user_${Date.now()}`,
            email: userData.email,
            name: userData.name,
            createdAt: new Date().toISOString()
          };
          
          // In a real application, save the user to the database
          resolve(user);
        } else {
          reject(new Error('Invalid registration data'));
        }
      }, 800);
    });
  }
  
  // Update user profile
  async updateUser(userData) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = { ...currentUser, ...userData };
        const token = this.createSessionToken(updatedUser);
        localStorage.setItem(this.SESSION_TOKEN_KEY, token);
        resolve(updatedUser);
      }, 500);
    });
  }
  
  // Logout user
  async logout() {
    return new Promise((resolve) => {
      localStorage.removeItem(this.SESSION_TOKEN_KEY);
      resolve(true);
    });
  }
  
  // Create a session token (JWT-like)
  createSessionToken(user) {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const payload = {
      user,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.SESSION_DURATION / 1000
    };
    
    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));
    
    // In a real application, this would be signed with a secret key
    // Here we're just simulating JWT format
    const signature = btoa(`${base64Header}.${base64Payload}.secret`);
    
    return `${base64Header}.${base64Payload}.${signature}`;
  }
}
