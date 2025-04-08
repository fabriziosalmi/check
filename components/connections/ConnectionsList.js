import { useState } from 'react';
import ConnectionCard from './ConnectionCard';

export default function ConnectionsList({ connections, onSendMessage, onDeleteConnection }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  
  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         connection.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterActive === 'all') return matchesSearch;
    if (filterActive === 'active') return matchesSearch && connection.isActive;
    if (filterActive === 'inactive') return matchesSearch && !connection.isActive;
    
    return matchesSearch;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full input"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Filter:</span>
          <div className="flex rounded-md shadow-sm">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                filterActive === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 rounded-l-md`}
              onClick={() => setFilterActive('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                filterActive === 'active'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-gray-300`}
              onClick={() => setFilterActive('active')}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                filterActive === 'inactive'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 rounded-r-md`}
              onClick={() => setFilterActive('inactive')}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>
      
      {filteredConnections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No connections found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? `No connections matching "${searchTerm}"`
              : 'Get started by connecting with other users'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnections.map(connection => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onSendMessage={onSendMessage}
              onDeleteConnection={onDeleteConnection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
