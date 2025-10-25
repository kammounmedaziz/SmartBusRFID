import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Activity, TrendingUp } from 'lucide-react';

const ControllerStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/controller/my-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  const successRate = stats?.total_validations > 0
    ? ((stats.successful_validations / stats.total_validations) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Validations */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{stats?.total_validations || 0}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Validations</p>
        </div>

        {/* Successful Validations */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{stats?.successful_validations || 0}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Successful</p>
        </div>

        {/* Failed Validations */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-600">{stats?.failed_validations || 0}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Failed</p>
        </div>

        {/* Success Rate */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">{successRate}%</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Success Rate</p>
        </div>
      </div>

      {/* Today's Performance */}
      {stats?.today_validations !== undefined && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h3 className="font-bold text-gray-800 mb-3">Today&apos;s Performance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Validations Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.today_validations}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{stats.total_fare_collected || 0} DZD</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControllerStats;
