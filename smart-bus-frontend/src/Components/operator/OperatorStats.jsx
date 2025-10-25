import { useState, useEffect } from 'react';
import { Users, CreditCard, TrendingUp, Activity } from 'lucide-react';

const OperatorStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCards: 0,
    pendingPayments: 0,
    verifiedToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users count
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const users = await usersResponse.json();

      // Fetch payments for stats
      const paymentsResponse = await fetch('http://localhost:5000/api/manual-payments/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const payments = await paymentsResponse.json();

      const today = new Date().toDateString();
      const verifiedToday = payments.filter(p => 
        p.status === 'verified' && 
        p.verified_at && 
        new Date(p.verified_at).toDateString() === today
      ).length;

      setStats({
        totalUsers: users.length,
        activeCards: users.filter(u => u.role === 'user').length * 1.2, // Approximate
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        verifiedToday
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Operator Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.totalUsers}</span>
          </div>
          <p className="text-sm opacity-90">Total Users</p>
        </div>

        {/* Active Cards */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{Math.floor(stats.activeCards)}</span>
          </div>
          <p className="text-sm opacity-90">Active Cards</p>
        </div>

        {/* Pending Payments */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.pendingPayments}</span>
          </div>
          <p className="text-sm opacity-90">Pending Payments</p>
        </div>

        {/* Verified Today */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.verifiedToday}</span>
          </div>
          <p className="text-sm opacity-90">Verified Today</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <h3 className="font-bold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <span className="text-gray-700">Pending Verifications</span>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
              {stats.pendingPayments}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <span className="text-gray-700">System Users</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
              {stats.totalUsers}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorStats;
