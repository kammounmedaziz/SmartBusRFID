import { useState, useEffect } from 'react';

const ControllerActivityMonitor = () => {
  const [validations, setValidations] = useState([]);
  const [controllerLogs, setControllerLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('validations');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [validationsResponse, logsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/controller/all-validations', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:5000/api/controller/all-logs', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (!validationsResponse.ok || !logsResponse.ok) throw new Error('Failed to fetch data');

      const validationsData = await validationsResponse.json();
      const logsData = await logsResponse.json();

      setValidations(validationsData);
      setControllerLogs(logsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getActionBadge = (action) => {
    const actionColors = {
      validation: 'bg-blue-100 text-blue-800',
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[action] || 'bg-gray-100 text-gray-800'}`}>
        {action.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-800">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Controller Activity Monitor</h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('validations')}
          className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'validations' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Validations ({validations.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'logs' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Activity Logs ({controllerLogs.length})
        </button>
      </div>

      {activeTab === 'validations' ? (
        validations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No validations yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Controller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card UID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {validations.map((validation) => (
                  <tr key={validation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(validation.validation_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {validation.controller_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {validation.card_uid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {validation.user_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {validation.fare_amount} DZD
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
        controllerLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activity logs yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Controller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {controllerLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.controller_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action_type)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
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
  );
};

export default ControllerActivityMonitor;
