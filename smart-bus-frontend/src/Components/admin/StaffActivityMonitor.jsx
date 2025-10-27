import { useState, useEffect } from 'react';

const StaffActivityMonitor = () => {
  const [validations, setValidations] = useState([]);
  const [staffLogs, setStaffLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('validations');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [validationsResponse, logsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/controller/all-validations', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false, json: async () => ({ data: [] }) })),
        fetch('http://localhost:5000/api/controller/all-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false, json: async () => ({ data: [] }) }))
      ]);

      const validationsData = validationsResponse.ok ? await validationsResponse.json() : { data: [] };
      const logsData = logsResponse.ok ? await logsResponse.json() : { data: [] };

      setValidations(validationsData.data || []);
      setStaffLogs(logsData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setValidations([]);
      setStaffLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      success: 'backdrop-blur-md bg-green-500/30 text-green-100 border border-green-400/50',
      failed: 'backdrop-blur-md bg-red-500/30 text-red-100 border border-red-400/50'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getActionBadge = (action) => {
    const actionColors = {
      validation: 'backdrop-blur-md bg-blue-500/30 text-blue-100 border border-blue-400/50',
      login: 'backdrop-blur-md bg-green-500/30 text-green-100 border border-green-400/50',
      logout: 'backdrop-blur-md bg-gray-500/30 text-gray-100 border border-gray-400/50'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${actionColors[action] || 'backdrop-blur-md bg-gray-500/30 text-gray-100 border border-gray-400/50'}`}>
        {action.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-200">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Staff Activity Monitor</h2>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('validations')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'validations' ? 'backdrop-blur-md bg-blue-500/30 text-white border border-blue-400/50' : 'backdrop-blur-md bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}`}
          >
            Validations ({validations.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'logs' ? 'backdrop-blur-md bg-blue-500/30 text-white border border-blue-400/50' : 'backdrop-blur-md bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}`}
          >
            Activity Logs ({staffLogs.length})
          </button>
        </div>

        {activeTab === 'validations' ? (
          validations.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No validations yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="backdrop-blur-md bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Controller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Card UID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Fare
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="backdrop-blur-sm divide-y divide-white/10">
                  {validations.map((validation) => (
                    <tr key={validation.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(validation.validation_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {validation.controller_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                        {validation.card_uid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {validation.user_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {validation.fare_amount} T-Pay
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(validation.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          staffLogs.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No activity logs yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="backdrop-blur-md bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="backdrop-blur-sm divide-y divide-white/10">
                  {staffLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {log.controller_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActionBadge(log.action_type)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {log.action_details || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StaffActivityMonitor;
