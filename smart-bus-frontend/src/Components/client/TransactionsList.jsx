import { useEffect, useState } from 'react';
import api from '../../utils/apiClient';

const TransactionsList = () => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTxs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }
      const res = await api.getMyTransactions(token);
      setTxs(res?.data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to load transactions. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
    const handler = () => fetchTxs();
    window.addEventListener('cards:updated', handler);
    return () => window.removeEventListener('cards:updated', handler);
  }, []);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2 text-white">Recent Transactions</h2>
      {txs.length === 0 ? (
        <div className="text-gray-300">No recent transactions.</div>
      ) : (
        <div className="space-y-2">
          {txs.map(t => (
            <div key={t.id} className="p-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-lg hover:bg-white/15 transition-all duration-300">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm text-gray-300">{new Date(t.timestamp).toLocaleString()}</div>
                  <div className="font-medium text-white">{t.type || 'transaction'} — Card: {t.card_uid || t.uid || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300">Amount</div>
                  <div className={`font-semibold text-lg ${t.type === 'recharge' ? 'text-green-300' : 'text-red-300'}`}>
                    {t.type === 'recharge' ? '+' : '-'}{t.amount?.toFixed?.(2) ?? t.amount} T-Pay
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
