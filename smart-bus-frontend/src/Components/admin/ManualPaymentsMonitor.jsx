import { useState, useEffect } from 'react';

const ManualPaymentsMonitor = () => {
  const [payments, setPayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const [allResponse, pendingResponse] = await Promise.all([
        fetch('http://localhost:5000/api/manual-payments/all', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:5000/api/manual-payments/pending', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (!allResponse.ok || !pendingResponse.ok) throw new Error('Failed to fetch payments');

      const allData = await allResponse.json();
      const pendingData = await pendingResponse.json();

      setPayments(allData);
      setPendingPayments(pendingData);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/manual-payments/${paymentId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to verify payment');

      alert(`Payment ${status === 'verified' ? 'approved' : 'rejected'} successfully!`);
      fetchPayments();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'backdrop-blur-md bg-yellow-500/30 text-yellow-100 border border-yellow-400/50',
      verified: 'backdrop-blur-md bg-green-500/30 text-green-100 border border-green-400/50',
      rejected: 'backdrop-blur-md bg-red-500/30 text-red-100 border border-red-400/50'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const displayPayments = activeTab === 'pending' ? pendingPayments : payments;

  if (loading) {
    return <div className="text-center py-8 text-gray-200">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Manual Payments Monitor</h2>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'pending' ? 'backdrop-blur-md bg-blue-500/30 text-white border border-blue-400/50' : 'backdrop-blur-md bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}`}
          >
            Pending ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'all' ? 'backdrop-blur-md bg-blue-500/30 text-white border border-blue-400/50' : 'backdrop-blur-md bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}`}
          >
            All Payments ({payments.length})
          </button>
        </div>

        {displayPayments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No {activeTab} payments</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
            <thead className="backdrop-blur-md bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="backdrop-blur-sm divide-y divide-white/10">
              {displayPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {payment.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {payment.amount} T-Pay
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                    {payment.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                    {payment.reference_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(payment.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payment.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(payment.id, 'verified')}
                          className="backdrop-blur-md bg-green-500/30 hover:bg-green-500/40 border border-green-400/50 text-green-100 px-3 py-1 rounded transition-all duration-300"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerify(payment.id, 'rejected')}
                          className="backdrop-blur-md bg-red-500/30 hover:bg-red-500/40 border border-red-400/50 text-red-100 px-3 py-1 rounded transition-all duration-300"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">
                        {payment.verified_by_name ? `By ${payment.verified_by_name}` : '-'}
                      </span>
                    )}
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

export default ManualPaymentsMonitor;
