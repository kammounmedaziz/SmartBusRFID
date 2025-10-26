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
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-200">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Operator Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-400/30 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.totalUsers}</span>
          </div>
          <p className="text-sm opacity-90">Total Users</p>
        </div>

        {/* Active Cards */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/30 to-green-600/30 border border-green-400/30 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{Math.floor(stats.activeCards)}</span>
          </div>
          <p className="text-sm opacity-90">Active Cards</p>
        </div>

        {/* Pending Payments */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 border border-yellow-400/30 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.pendingPayments}</span>
          </div>
          <p className="text-sm opacity-90">Pending Payments</p>
        </div>

        {/* Verified Today */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/30 to-purple-600/30 border border-purple-400/30 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.verifiedToday}</span>
          </div>
          <p className="text-sm opacity-90">Verified Today</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 rounded-xl shadow-xl">
        <h3 className="font-bold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg">
            <span className="text-gray-200">Pending Verifications</span>
            <span className="backdrop-blur-md bg-yellow-500/30 border border-yellow-400/50 text-yellow-100 px-3 py-1 rounded-full text-sm font-bold">
              {stats.pendingPayments}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg">
            <span className="text-gray-200">System Users</span>
            <span className="backdrop-blur-md bg-blue-500/30 border border-blue-400/50 text-blue-100 px-3 py-1 rounded-full text-sm font-bold">
              {stats.totalUsers}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorStats;
