"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiUsers, FiMonitor, FiMessageSquare, FiTrendingUp, FiSettings, FiTrash2, FiEdit3, FiEye, FiRefreshCw } from 'react-icons/fi';
import AdminGameSearch from '@/components/AdminGameSearch';

// Types
type Game = {
  id: number;
  name: string;
  background_image: string | null;
  released: string;
  slug: string;
  [key: string]: any;
};

type Stats = {
  totalGames: number;
  totalUsers: number;
  totalComments: number;
  totalViews: number;
};

type User = {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
};

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameData, setGameData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch dashboard stats - moved before conditional returns
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
          <p className="text-gray-400">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  async function handleSelect(game: Game) {
    setSelectedGame(game);
    setLoading(true);
    setMessage('');
    try {
    const res = await fetch(`/api/game/${game.slug}`);
    if (res.ok) {
      const data = await res.json();
      setGameData(data);
    } else {
      setGameData(null);
        setMessage('Failed to fetch game data.');
      }
    } catch (error) {
      setMessage('Failed to fetch game data.');
    }
    setLoading(false);
  }

  function handleFieldChange(field: string, value: string) {
    setGameData((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave() {
    if (!selectedGame || !gameData) return;
    setLoading(true);
    setMessage('');
    try {
    const res = await fetch(`/api/admin/game/${selectedGame.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameData }),
    });
    if (res.ok) {
      setMessage('Game updated successfully!');
    } else {
        setMessage('Failed to update game.');
      }
    } catch (error) {
      setMessage('Failed to update game.');
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!selectedGame) return;
    if (!window.confirm('Are you sure you want to delete this game from the cache?')) return;
    setLoading(true);
    setMessage('');
    try {
    const res = await fetch(`/api/admin/game/${selectedGame.slug}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Game deleted from cache.');
      setSelectedGame(null);
      setGameData(null);
    } else {
        setMessage('Failed to delete game.');
      }
    } catch (error) {
      setMessage('Failed to delete game.');
    }
    setLoading(false);
  }

  async function handleUserRoleChange(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setMessage('User role updated successfully!');
        fetchUsers(); // Refresh the list
      } else {
        setMessage('Failed to update user role.');
      }
    } catch (error) {
      setMessage('Failed to update user role.');
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-200">
                Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: FiTrendingUp },
              { id: 'games', name: 'Manage Games', icon: FiMonitor },
              { id: 'users', name: 'Users', icon: FiUsers },
              { id: 'settings', name: 'Settings', icon: FiSettings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('success') 
              ? 'bg-green-900 border border-green-700 text-green-200' 
              : 'bg-red-900 border border-red-700 text-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiMonitor className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-400 truncate">Total Games</dt>
                          <dd className="text-lg font-medium text-white">{stats.totalGames}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiUsers className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-400 truncate">Total Users</dt>
                          <dd className="text-lg font-medium text-white">{stats.totalUsers}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiMessageSquare className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-400 truncate">Total Comments</dt>
                          <dd className="text-lg font-medium text-white">{stats.totalComments}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiEye className="h-6 w-6 text-orange-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-400 truncate">Total Views</dt>
                          <dd className="text-lg font-medium text-white">{stats.totalViews}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('games')}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FiMonitor className="mr-2 h-4 w-4" />
                    Manage Games
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <FiUsers className="mr-2 h-4 w-4" />
                    Manage Users
                  </button>
                  <button
                    onClick={fetchStats}
                    className="flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Refresh Stats
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            <div className="bg-gray-800 shadow rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">Search and Edit Games</h3>
              <div className="mb-6">
                <AdminGameSearch onSelect={handleSelect} placeholder="Search for games to edit..." />
              </div>
              
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}

      {gameData && (
                <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {selectedGame?.background_image && (
                        <img
                          src={selectedGame.background_image}
                          alt={selectedGame.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <h4 className="text-lg font-medium text-white">
                          {selectedGame?.name}
                        </h4>
                        {selectedGame?.released && (
                          <p className="text-sm text-gray-400">
                            Released: {new Date(selectedGame.released).getFullYear()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        <FiEdit3 className="mr-2 h-4 w-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        <FiTrash2 className="mr-2 h-4 w-4" />
                        Delete Game
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(gameData).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          {key}
                        </label>
              <textarea
                          className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
                          rows={4}
                value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value !== undefined && value !== null ? String(value) : ''}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
              />
            </div>
          ))}
                  </div>
                </div>
              )}

              {!gameData && !loading && (
                <div className="text-center py-12">
                  <FiMonitor className="mx-auto h-12 w-12 text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-400">No game selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Search for a game above to start editing.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">User Management</h3>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{user.username}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' 
                              ? 'bg-red-900 text-red-200' 
                              : 'bg-green-900 text-green-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={user.role}
                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                            className="px-3 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-white mb-4">Admin Settings</h3>
              <div className="space-y-4">
                <div className="border border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-2">Cache Management</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Clear cached game data to refresh from external APIs.
                  </p>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
                    Clear All Cache
                  </button>
                </div>

                <div className="border border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-2">System Information</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Environment: {process.env.NODE_ENV}</p>
                    <p>Database: PostgreSQL</p>
                    <p>Framework: Next.js 15</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 