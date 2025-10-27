import { useState, useEffect } from 'react';
import { UserPlus, X, Search, Shield, Crown, Wrench } from 'lucide-react';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Load all users on component mount
  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data);
      setHasSearched(false); // Show all users initially
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query || query.trim().length === 0) {
      // If search is cleared, load all users again
      loadAllUsers();
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to search users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Debounce search
    window.searchTimeout = setTimeout(() => {
      searchUsers(value);
    }, 500);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      setFormSuccess('User created successfully!');
      setFormData({ name: '', email: '', password: '', role: 'user' });

      // Refresh user list
      if (searchQuery.trim().length > 0) {
        searchUsers(searchQuery);
      } else {
        loadAllUsers();
      }

      setTimeout(() => {
        setShowCreateModal(false);
        setFormSuccess('');
      }, 2000);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      // Refresh user list
      if (searchQuery.trim().length > 0) {
        searchUsers(searchQuery);
      } else {
        loadAllUsers();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: {
        icon: Crown,
        color: 'backdrop-blur-md bg-red-500/30 text-red-100 border border-red-400/50',
        label: 'ADMIN'
      },
      operator: {
        icon: Shield,
        color: 'backdrop-blur-md bg-blue-500/30 text-blue-100 border border-blue-400/50',
        label: 'OPERATOR'
      },
      controller: {
        icon: Wrench,
        color: 'backdrop-blur-md bg-green-500/30 text-green-100 border border-green-400/50',
        label: 'CONTROLLER'
      },
      user: {
        icon: null,
        color: 'backdrop-blur-md bg-gray-500/30 text-gray-100 border border-gray-400/50',
        label: 'USER'
      }
    };

    const config = roleConfig[role] || roleConfig.user;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
        {Icon && <Icon className="w-3 h-3" />}
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 backdrop-blur-md bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/50 text-white px-4 py-2 rounded-lg transition-all duration-300"
          >
            <UserPlus className="w-5 h-5" />
            Create User
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search users by name or email..."
              className="w-full pl-11 pr-4 py-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
            />
          </div>
          <p className="mt-2 text-sm text-gray-400">
            {hasSearched
              ? `Found ${users.length} user${users.length !== 1 ? 's' : ''}`
              : `${users.length} user${users.length !== 1 ? 's' : ''} loaded`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 backdrop-blur-md bg-red-500/20 border border-red-400/30 text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-200">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 backdrop-blur-md bg-white/5 rounded-xl border border-white/10">
            <p className="text-gray-300 text-lg">No users found</p>
            <p className="text-gray-400 text-sm mt-2">
              {hasSearched ? 'Try a different search term' : 'No users in the system yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
            <thead className="backdrop-blur-md bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="backdrop-blur-sm divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-300 hover:text-red-100 font-medium transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Create New User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 backdrop-blur-md bg-red-500/20 border border-red-400/30 text-red-100 rounded-lg">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 backdrop-blur-md bg-green-500/20 border border-green-400/30 text-green-100 rounded-lg">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-gray-200 font-medium mb-2">
                  Name <span className="text-red-300">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-gray-200 font-medium mb-2">
                  Email <span className="text-red-300">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-200 font-medium mb-2">
                  Password <span className="text-red-300">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-gray-200 font-medium mb-2">
                  Role <span className="text-red-300">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="w-full px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="user" className="bg-gray-800">User (Passenger)</option>
                  <option value="controller" className="bg-gray-800">Controller</option>
                  <option value="operator" className="bg-gray-800">Operator</option>
                  <option value="admin" className="bg-gray-800">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 backdrop-blur-md bg-gray-500/30 hover:bg-gray-500/40 border border-gray-400/50 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 backdrop-blur-md bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/50 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;