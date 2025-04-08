export class ConnectionManager {
  constructor() {
    this.CONNECTIONS_STORAGE_KEY = 'user_connections';
    this.MESSAGES_STORAGE_KEY = 'user_messages';
  }
  
  // Get all connections
  getActiveConnections() {
    try {
      const connections = localStorage.getItem(this.CONNECTIONS_STORAGE_KEY);
      return connections ? JSON.parse(connections) : [];
    } catch (error) {
      console.error('Error retrieving connections:', error);
      return [];
    }
  }
  
  // Save a new connection
  saveConnection(connection) {
    try {
      const connections = this.getActiveConnections();
      
      // Check if connection already exists
      const existingConnection = connections.find(c => c.email === connection.email);
      if (existingConnection) {
        throw new Error('Connection already exists');
      }
      
      const newConnection = {
        ...connection,
        id: `connection_${Date.now()}`,
        connectedSince: new Date().toISOString(),
        isActive: true,
        lastActivity: new Date().toISOString()
      };
      
      const updatedConnections = [...connections, newConnection];
      localStorage.setItem(this.CONNECTIONS_STORAGE_KEY, JSON.stringify(updatedConnections));
      
      return newConnection;
    } catch (error) {
      console.error('Error saving connection:', error);
      throw error;
    }
  }
  
  // Delete a connection
  deleteConnection(connectionId) {
    try {
      const connections = this.getActiveConnections();
      const updatedConnections = connections.filter(conn => conn.id !== connectionId);
      localStorage.setItem(this.CONNECTIONS_STORAGE_KEY, JSON.stringify(updatedConnections));
      
      // Also delete associated messages
      this.deleteConnectionMessages(connectionId);
      
      return true;
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw new Error('Failed to delete connection');
    }
  }
  
  // Update connection status
  updateConnectionStatus(connectionId, isActive) {
    try {
      const connections = this.getActiveConnections();
      const updatedConnections = connections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, isActive, lastActivity: new Date().toISOString() } 
          : conn
      );
      
      localStorage.setItem(this.CONNECTIONS_STORAGE_KEY, JSON.stringify(updatedConnections));
      return updatedConnections.find(conn => conn.id === connectionId);
    } catch (error) {
      console.error('Error updating connection status:', error);
      throw new Error('Failed to update connection status');
    }
  }
  
  // Send a message to a connection
  sendMessage(connectionId, messageText) {
    try {
      // Check if connection exists
      const connections = this.getActiveConnections();
      const connection = connections.find(conn => conn.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }
      
      const messages = this.getConnectionMessages(connectionId);
      const newMessage = {
        id: `msg_${Date.now()}`,
        connectionId,
        text: messageText,
        timestamp: new Date().toISOString(),
        sender: 'user',
        isRead: false
      };
      
      const updatedMessages = [...messages, newMessage];
      localStorage.setItem(`${this.MESSAGES_STORAGE_KEY}_${connectionId}`, JSON.stringify(updatedMessages));
      
      // Update connection last activity
      this.updateConnectionStatus(connectionId, true);
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  // Get messages for a connection
  getConnectionMessages(connectionId) {
    try {
      const messages = localStorage.getItem(`${this.MESSAGES_STORAGE_KEY}_${connectionId}`);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Error retrieving messages:', error);
      return [];
    }
  }
  
  // Delete all messages for a connection
  deleteConnectionMessages(connectionId) {
    try {
      localStorage.removeItem(`${this.MESSAGES_STORAGE_KEY}_${connectionId}`);
      return true;
    } catch (error) {
      console.error('Error deleting messages:', error);
      return false;
    }
  }
  
  // Get connection stats
  getConnectionStats() {
    const connections = this.getActiveConnections();
    const totalConnections = connections.length;
    const activeConnections = connections.filter(conn => conn.isActive).length;
    
    const messageCount = connections.reduce((total, conn) => {
      const messages = this.getConnectionMessages(conn.id);
      return total + messages.length;
    }, 0);
    
    return {
      totalConnections,
      activeConnections,
      messageCount
    };
  }
}
