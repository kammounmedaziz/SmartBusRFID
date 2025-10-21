import { useEffect, useState } from 'react';
import api from '../../utils/apiClient';
import AddCardForm from './AddCardForm';

const CardManagement = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await api.getMyCards(token);
      setCards(res?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this card?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.deleteMyCard(token, id);
      fetchCards();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleRecharge = async (id, amount) => {
    try {
      const token = localStorage.getItem('token');
      await api.rechargeMyCard(token, { card_id: id, amount });
      fetchCards();
    } catch (err) {
      alert(err.message || 'Failed to recharge');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Your Cards</h2>
        {loading ? <div>Loading...</div> : error ? <div className="text-red-400">{error}</div> : (
          <div className="space-y-4">
            {cards.map(c => (
              <div key={c.id} className="p-4 bg-gray-800 rounded border border-gray-700 flex items-center justify-between">
                <div>
                  <div className="font-mono">{c.uid}</div>
                  <div className="text-sm text-gray-400">Balance: {c.balance}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { const a = prompt('Amount to recharge:'); if (a) handleRecharge(c.id, parseFloat(a)); }} className="px-3 py-1 bg-cyan-600 rounded">Recharge</button>
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-600 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <aside>
        <AddCardForm />
      </aside>
    </div>
  );
};

export default CardManagement;
