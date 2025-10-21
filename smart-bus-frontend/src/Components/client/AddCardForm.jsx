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
    <form onSubmit={handleCreate} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
      <h3 className="font-semibold mb-3">Add new card</h3>
      <input value={uid} onChange={e => setUid(e.target.value)} placeholder="Card UID" className="w-full p-2 mb-2 bg-gray-800 border border-gray-700 rounded" />
      <input value={balance} onChange={e => setBalance(e.target.value)} placeholder="Initial balance (optional)" className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded" />
      <button type="submit" className="w-full py-2 bg-cyan-600 rounded" disabled={loading}>{loading ? 'Adding...' : 'Add Card'}</button>
    </form>
  );
};

export default AddCardForm;
