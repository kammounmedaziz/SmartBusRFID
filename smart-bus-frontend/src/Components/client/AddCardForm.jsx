import { useState } from 'react';
import api from '../../utils/apiClient';

const AddCardForm = () => {
  const [uid, setUid] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!uid) return alert('Enter card UID');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { uid, balance: balance ? parseFloat(balance) : undefined };
  await api.createCardForMe(token, payload);
  alert('Card added successfully');
      setUid(''); setBalance('');
      // trigger global refresh by dispatching a custom event
      window.dispatchEvent(new Event('cards:updated'));
    } catch (err) {
      alert(err.message || 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="p-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl">
      <h3 className="font-semibold mb-3 text-white">Add new card</h3>
      <input value={uid} onChange={e => setUid(e.target.value)} placeholder="Card UID" className="w-full p-2 mb-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
      <input value={balance} onChange={e => setBalance(e.target.value)} placeholder="Initial balance (optional)" className="w-full p-2 mb-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
      <button type="submit" className="w-full py-2 backdrop-blur-md bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 rounded-lg text-white font-medium transition-all duration-300" disabled={loading}>{loading ? 'Adding...' : 'Add Card'}</button>
    </form>
  );
};

export default AddCardForm;
