import { useState, useEffect } from 'react';
import { Users, UserCog, Shield, User } from 'lucide-react';
import PropTypes from 'prop-types';
import axios from 'axios';

const UserTypeStats = () => {
  const [userStats, setUserStats] = useState({
    admins: 0,
    operators: 0,
    controllers: 0,
    users: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const users = response.data || [];
      const stats = {
        admins: users.filter(u => u.role === 'admin').length,
        operators: users.filter(u => u.role === 'operator').length,
        controllers: users.filter(u => u.role === 'controller').length,
        users: users.filter(u => u.role === 'user' || !u.role).length,
        total: users.length
      };

      setUserStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setLoading(false);
    }
  };

  const UserTypeCard = ({ title, count, icon: Icon, color, bgColor, borderColor }) => (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-xl p-4 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bgColor} border ${borderColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="flex-1">
          <p className="text-gray-300 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{count}</p>
        </div>
      </div>
    </div>
  );

  UserTypeCard.propTypes = {
    title: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string.isRequired,
    bgColor: PropTypes.string.isRequired,
    borderColor: PropTypes.string.isRequired,
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">User Types Distribution</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <UserTypeCard
          title="Total Users"
          count={userStats.total}
          icon={Users}
          color="text-white"
          bgColor="bg-gray-500/20"
          borderColor="border-gray-400/30"
        />
        <UserTypeCard
          title="Admins"
          count={userStats.admins}
          icon={Users}
          color="text-red-400"
          bgColor="bg-red-500/20"
          borderColor="border-red-400/30"
        />
        <UserTypeCard
          title="Operators"
          count={userStats.operators}
          icon={UserCog}
          color="text-blue-400"
          bgColor="bg-blue-500/20"
          borderColor="border-blue-400/30"
        />
        <UserTypeCard
          title="Controllers"
          count={userStats.controllers}
          icon={Shield}
          color="text-purple-400"
          bgColor="bg-purple-500/20"
          borderColor="border-purple-400/30"
        />
        <UserTypeCard
          title="Regular Users"
          count={userStats.users}
          icon={User}
          color="text-green-400"
          bgColor="bg-green-500/20"
          borderColor="border-green-400/30"
        />
      </div>
    </div>
  );
};

export default UserTypeStats;
