import { useState, useEffect } from 'react';
import { Activity, UserCog, Shield, Clock } from 'lucide-react';
import axios from 'axios';

const StaffActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch recent controller activities
      const [validationsResponse, logsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/controller/all-validations', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/controller/all-logs', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      // Combine activities (handle responses shaped as { data: [...] } or raw arrays)
      const validationsArray = validationsResponse.data?.data ?? validationsResponse.data ?? [];
      const logsArray = logsResponse.data?.data ?? logsResponse.data ?? [];

      const validations = (validationsArray || []).map(v => ({
        id: `v-${v.id}`,
        type: 'validation',
        user: v.controller_name,
        userId: v.controller_id,
        action: 'Validated ticket',
        details: `Card: ${v.card_uid} - ${v.fare_amount} T-Pay`,
        time: v.validation_time,
        status: v.status,
        role: 'controller'
      }));

      const logs = (logsArray || []).map(l => ({
        id: `l-${l.id}`,
        type: 'log',
        user: l.controller_name,
        userId: l.controller_id,
        action: l.action_type,
        details: l.action_details || '-',
        time: l.timestamp,
        role: 'controller'
      }));

      // Combine all activities
      const allActivities = [...validations, ...logs]
        .sort((a, b) => new Date(b.time) - new Date(a.time));

      // Get only the last activity for each staff member (by user name)
      // Use a Map to keep only the most recent activity per staff member
      const lastActivityMap = new Map();
      allActivities.forEach(activity => {
        if (activity.user && activity.user.trim() && !lastActivityMap.has(activity.user)) {
          lastActivityMap.set(activity.user, activity);
        }
      });

      // Convert map to array and sort by time (most recent first), limit to 8
      const lastActivities = Array.from(lastActivityMap.values())
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 8);

      setActivities(lastActivities);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const getActivityIcon = (role) => {
    if (role === 'operator') return UserCog;
    if (role === 'controller') return Shield;
    return Activity;
  };

  const getActivityColor = (role) => {
    if (role === 'operator') return 'text-blue-400';
    if (role === 'controller') return 'text-purple-400';
    return 'text-gray-400';
  };

  const getActivityBgColor = (role) => {
    if (role === 'operator') return 'bg-blue-500/20';
    if (role === 'controller') return 'bg-purple-500/20';
    return 'bg-gray-500/20';
  };

  const getActivityBorder = (role) => {
    if (role === 'operator') return 'border-blue-400/30';
    if (role === 'controller') return 'border-purple-400/30';
    return 'border-gray-400/30';
  };

  const getStatusBadge = (status) => {
    if (status === 'success') {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-md bg-green-500/30 text-green-100 border border-green-400/50">Success</span>;
    }
    if (status === 'failed') {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-md bg-red-500/30 text-red-100 border border-red-400/50">Failed</span>;
    }
    return null;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Staff Activity
        </h2>
        <button 
          onClick={fetchActivities}
          className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
        >
          <Clock className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No recent activities
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.role);
            return (
              <div 
                key={activity.id}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getActivityBgColor(activity.role)} border ${getActivityBorder(activity.role)} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${getActivityColor(activity.role)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white font-medium">{activity.user}</p>
                        <p className="text-gray-300 text-sm">{activity.action}</p>
                        <p className="text-gray-400 text-xs mt-1 truncate">{activity.details}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-gray-400">{formatTime(activity.time)}</span>
                        {activity.status && getStatusBadge(activity.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StaffActivity;
