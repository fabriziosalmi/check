import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';

const SESSION_TOKEN_KEY = 'user_session_token';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
    if (storedToken) {
      try {
        const decoded = jwt.decode(storedToken);
        const currentTime = Date.now() / 1000;
        
        if (decoded && decoded.exp > currentTime) {
          // Valid token
          setUser(decoded.user);
        } else {
          // Expired token
          localStorage.removeItem(SESSION_TOKEN_KEY);
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem(SESSION_TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Session management functions
  const login = async (email, password) => {
    // Simulate API call - replace with actual API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (email && password) {
          const user = { id: '123', email, name: email.split('@')[0] };
          const token = createSessionToken(user);
          localStorage.setItem(SESSION_TOKEN_KEY, token);
          setUser(user);
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const logout = async () => {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    const token = createSessionToken(newUser);
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    setUser(newUser);
  };

  // Helper functions
  const createSessionToken = (user) => {
    // Replace with proper JWT signing using a secure key
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION / 1000;
    return jwt.sign({ user, exp: expiresAt }, 'your_secret_key');
  };

  return {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  };
}

// Connection session management
export class ConnectionManager {
  static getActiveConnections() {
    try {
      const connections = localStorage.getItem('user_connections');
      return connections ? JSON.parse(connections) : [];
    } catch (error) {
      console.error('Error retrieving connections:', error);
      return [];
    }
  }

  static saveConnection(connection) {
    try {
      const connections = this.getActiveConnections();
      const updatedConnections = [...connections, {
        ...connection,
        id: Date.now().toString(),
        connectedSince: new Date().toISOString(),
        isActive: true
      }];
      localStorage.setItem('user_connections', JSON.stringify(updatedConnections));
      return updatedConnections;
    } catch (error) {
      console.error('Error saving connection:', error);
      throw new Error('Failed to save connection');
    }
  }

  static deleteConnection(connectionId) {
    try {
      const connections = this.getActiveConnections();
      const updatedConnections = connections.filter(conn => conn.id !== connectionId);
      localStorage.setItem('user_connections', JSON.stringify(updatedConnections));
      return updatedConnections;
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw new Error('Failed to delete connection');
    }
  }

  static updateConnectionStatus(connectionId, isActive) {
    try {
      const connections = this.getActiveConnections();
      const updatedConnections = connections.map(conn => 
        conn.id === connectionId ? { ...conn, isActive } : conn
      );
      localStorage.setItem('user_connections', JSON.stringify(updatedConnections));
      return updatedConnections;
    } catch (error) {
      console.error('Error updating connection status:', error);
      throw new Error('Failed to update connection status');
    }
  }
}
