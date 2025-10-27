import { useState, useEffect } from 'react';
import { Users, CreditCard, DollarSign, Activity, TrendingUp, AlertCircle } from 'lucide-react';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCards: 0,
    totalPayments: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
    totalRevenue: 0,
    activeControllers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch all stats in parallel
      const [userResponse, paymentResponse] = await Promise.all([
        fetch('http://localhost:5000/api/users', { headers }),
        fetch('http://localhost:5000/api/manual-payments/all', { headers })
      ]);

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('User response error:', errorText);
        throw new Error(`Failed to fetch users: ${userResponse.status} ${errorText}`);
      }
      
      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('Payment response error:', errorText);
        throw new Error(`Failed to fetch payments: ${paymentResponse.status} ${errorText}`);
      }

      const users = await userResponse.json();
      const payments = await paymentResponse.json();

      console.log('Fetched users:', users);
      console.log('Fetched payments:', payments);

      // Calculate stats
      const totalUsers = users.length || 0;
      const activeCards = users.filter(u => u.card_uid).length || 0;
      const totalPayments = payments.length || 0;
      const pendingPayments = payments.filter(p => p.status === 'pending').length || 0;
      const verifiedPayments = payments.filter(p => p.status === 'verified').length || 0;
      const totalRevenue = payments
        .filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      // Count active staff (operators and controllers) - those who logged in recently
      const activeControllers = users.filter(u => u.role === 'controller').length || 0;

      setStats({
        totalUsers,
        activeCards,
        totalPayments,
        pendingPayments,
        verifiedPayments,
        totalRevenue,
        activeControllers
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-500/20')} border border-white/10`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Error Loading Statistics</h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="text-blue-400"
            subtitle="Registered users"
          />
          <StatCard
            title="Active Cards"
            value={stats.activeCards}
            icon={CreditCard}
            color="text-green-400"
            subtitle="Valid RFID cards"
          />
          <StatCard
            title="Active Controllers"
            value={stats.activeControllers}
            icon={Activity}
            color="text-purple-400"
            subtitle="Online in last 24h"
          />
          <StatCard
            title="Total Revenue"
            value={`${stats.totalRevenue.toFixed(2)} T-Pay`}
            icon={TrendingUp}
            color="text-yellow-400"
            subtitle="From verified payments"
          />
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Payment Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Payments"
            value={stats.totalPayments}
            icon={DollarSign}
            color="text-cyan-400"
            subtitle="All payment requests"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={AlertCircle}
            color="text-orange-400"
            subtitle="Awaiting approval"
          />
          <StatCard
            title="Verified Payments"
            value={stats.verifiedPayments}
            icon={TrendingUp}
            color="text-emerald-400"
            subtitle="Successfully processed"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">Review Payments</h3>
                <p className="text-sm text-gray-400">Approve pending payment requests</p>
              </div>
            </div>
          </button>

          <button className="p-4 backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">Monitor Controllers</h3>
                <p className="text-sm text-gray-400">Check controller activity and logs</p>
              </div>
            </div>
          </button>

          <button className="p-4 backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20 border border-green-400/30">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-green-300 transition-colors">Manage Users</h3>
                <p className="text-sm text-gray-400">Add, edit, or remove user accounts</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;