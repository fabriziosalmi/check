import { useState } from 'react';

export default function ConnectionCard({ connection, onSendMessage, onDeleteConnection }) {
  const [message, setMessage] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(connection.id, message);
      setMessage('');
      setShowMessageForm(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-medium text-primary">
              {connection.name ? connection.name[0].toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{connection.name}</h3>
            <p className="text-sm text-gray-500">{connection.email}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowMessageForm(!showMessageForm)}
            className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
          >
            Message
          </button>
          <button
            onClick={() => onDeleteConnection(connection.id)}
            className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
      
      {showMessageForm && (
        <form onSubmit={handleSendMessage} className="mt-4 space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            rows="3"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowMessageForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-sm"
            >
              Send Message
            </button>
          </div>
        </form>
      )}
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Connection Status</h4>
        <div className="flex items-center space-x-2">
          <span className={`h-2 w-2 rounded-full ${connection.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          <span className="text-sm text-gray-600">{connection.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Connected since {new Date(connection.connectedSince).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
