import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Calendar, DollarSign, BarChart3, Download } from 'lucide-react';

const SystemReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('14'); // days

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:5000/api/admin/reports/fare-by-day?days=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const calculateTotalRevenue = () => {
    return reports.reduce((sum, report) => sum + parseFloat(report.total || 0), 0);
  };

  const calculateAverageDaily = () => {
    if (reports.length === 0) return 0;
    return calculateTotalRevenue() / reports.length;
  };

  const getTopDay = () => {
    if (reports.length === 0) return null;
    return reports.reduce((max, report) =>
      parseFloat(report.total || 0) > parseFloat(max.total || 0) ? report : max
    );
  };

  const exportReports = () => {
    const csvContent = [
      ['Date', 'Total Revenue (T-Pay)'],
      ...reports.map(report => [report.day, report.total || 0])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fare-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <div>
            <h3 className="font-semibold">Error Loading Reports</h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">System Reports</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="7" className="bg-gray-800">Last 7 days</option>
                <option value="14" className="bg-gray-800">Last 14 days</option>
                <option value="30" className="bg-gray-800">Last 30 days</option>
                <option value="90" className="bg-gray-800">Last 90 days</option>
              </select>
            </div>
            <button
              onClick={exportReports}
              className="flex items-center gap-2 backdrop-blur-md bg-green-500/30 hover:bg-green-500/40 border border-green-400/50 text-white px-4 py-2 rounded-lg transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-400/30">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{calculateTotalRevenue().toFixed(2)} T-Pay</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/20 border border-green-400/30">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Daily Average</p>
                <p className="text-2xl font-bold text-white">{calculateAverageDaily().toFixed(2)} T-Pay</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-400/30">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Best Day</p>
                <p className="text-2xl font-bold text-white">
                  {getTopDay() ? `${getTopDay().total} T-Pay` : 'N/A'}
                </p>
                <p className="text-xs text-gray-400">
                  {getTopDay() ? new Date(getTopDay().day).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Chart visualization coming soon</p>
              <p className="text-sm text-gray-500 mt-2">Interactive charts will be implemented</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Daily Revenue Breakdown</h3>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No revenue data available for the selected period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="backdrop-blur-md bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Revenue (T-Pay)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="backdrop-blur-sm divide-y divide-white/10">
                {reports.map((report, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {new Date(report.day).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {parseFloat(report.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(report.total || 0) > 0
                          ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                      }`}>
                        {parseFloat(report.total || 0) > 0 ? 'Revenue' : 'No Revenue'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemReports;