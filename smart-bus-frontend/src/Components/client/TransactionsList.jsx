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
      const res = await api.getMyTransactions(token);
      setTxs(res?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
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
      <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
      {txs.length === 0 ? (
        <div className="text-gray-400">No recent transactions.</div>
      ) : (
        <div className="space-y-2">
          {txs.map(t => (
            <div key={t.id} className="p-3 bg-gray-800 rounded border border-gray-700">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm text-gray-400">{new Date(t.created_at).toLocaleString()}</div>
                  <div className="font-medium">{t.type || t.action || 'transaction'} — {t.card_uid || t.uid || ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Amount</div>
                  <div className="font-semibold">{t.amount?.toFixed?.(2) ?? t.amount}</div>
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
