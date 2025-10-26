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
        <h2 className="text-xl font-semibold mb-4 text-white">Your Cards</h2>
        {loading ? <div className="text-gray-300">Loading...</div> : error ? <div className="text-red-300">{error}</div> : (
          <div className="space-y-4">
            {cards.map(c => (
              <div key={c.id} className="p-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl hover:bg-white/15 transition-all duration-300 flex items-center justify-between">
                <div>
                  <div className="font-mono text-white font-semibold">{c.uid}</div>
                  <div className="text-sm text-gray-300">Balance: {c.balance} T-Pay</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { const a = prompt('Amount to recharge:'); if (a) handleRecharge(c.id, parseFloat(a)); }} className="px-3 py-1 backdrop-blur-md bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 rounded-lg text-white font-medium transition-all duration-300">Recharge</button>
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1 backdrop-blur-md bg-red-500/30 hover:bg-red-500/40 border border-red-400/50 rounded-lg text-white font-medium transition-all duration-300">Delete</button>
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
