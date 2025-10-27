import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]); // Keep all payments for stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, all, verified, rejected

  const fetchPayments = useCallback(async () => {
    try {
      // Always fetch all payments for stats
      const allResponse = await fetch('http://localhost:5000/api/operator/payments/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!allResponse.ok) throw new Error('Failed to fetch payments');
      const allData = await allResponse.json();
      setAllPayments(allData);
      
      // Filter based on current filter
      if (filter === 'all') {
        setPayments(allData);
      } else {
        setPayments(allData.filter(p => p.status === filter));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleVerifyPayment = async (paymentId, status) => {
    const action = status === 'verified' ? 'verify' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this payment?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/operator/payments/${paymentId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment');
      }

      fetchPayments();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'backdrop-blur-md bg-yellow-500/30 border border-yellow-400/50', text: 'text-yellow-100', icon: Clock },
      verified: { bg: 'backdrop-blur-md bg-green-500/30 border border-green-400/50', text: 'text-green-100', icon: CheckCircle },
      rejected: { bg: 'backdrop-blur-md bg-red-500/30 border border-red-400/50', text: 'text-red-100', icon: XCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methodColors = {
      cash: 'backdrop-blur-md bg-green-500/30 text-green-100 border border-green-400/50',
      card: 'backdrop-blur-md bg-blue-500/30 text-blue-100 border border-blue-400/50',
      mobile: 'backdrop-blur-md bg-purple-500/30 text-purple-100 border border-purple-400/50'
    };

    return (
      <span className={`px-2 py-1 rounded border text-xs font-medium ${methodColors[method]}`}>
        {method.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-200">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 border border-yellow-400/30 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">
              {allPayments.filter(p => p.status === 'pending').length}
            </span>
          </div>
          <p className="text-sm opacity-90">Pending Verification</p>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/30 to-green-600/30 border border-green-400/30 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">
              {allPayments.filter(p => p.status === 'verified').length}
            </span>
          </div>
          <p className="text-sm opacity-90">Verified</p>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/30 to-red-600/30 border border-red-400/30 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">
              {allPayments.filter(p => p.status === 'rejected').length}
            </span>
          </div>
          <p className="text-sm opacity-90">Rejected</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Payment Verification</h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                filter === 'pending'
                  ? 'backdrop-blur-md bg-yellow-500/30 border border-yellow-400/50 text-white'
                  : 'backdrop-blur-md bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                filter === 'verified'
                  ? 'backdrop-blur-md bg-green-500/30 border border-green-400/50 text-white'
                  : 'backdrop-blur-md bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                filter === 'rejected'
                  ? 'backdrop-blur-md bg-red-500/30 border border-red-400/50 text-white'
                  : 'backdrop-blur-md bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                filter === 'all'
                  ? 'backdrop-blur-md bg-blue-500/30 border border-blue-400/50 text-white'
                  : 'backdrop-blur-md bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 backdrop-blur-md bg-red-500/20 border border-red-400/30 text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {payments.length === 0 ? (
          <p className="text-gray-300 text-center py-8">No payments found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="backdrop-blur-md bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Date
                  </th>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="backdrop-blur-sm divide-y divide-white/10">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {new Date(payment.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {payment.user_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                      {payment.amount} T-Pay
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getPaymentMethodBadge(payment.payment_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                      {payment.reference_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyPayment(payment.id, 'verified')}
                            className="text-green-300 hover:text-green-100 font-medium transition-colors duration-200"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(payment.id, 'rejected')}
                            className="text-red-300 hover:text-red-100 font-medium transition-colors duration-200"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          {payment.verified_by_name ? `By ${payment.verified_by_name}` : 'N/A'}
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

export default PaymentVerification;
