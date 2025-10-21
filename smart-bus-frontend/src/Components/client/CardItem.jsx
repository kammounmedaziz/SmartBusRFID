import { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../utils/apiClient';

const CardItem = ({ card, onUpdated }) => {
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState('');

  const handlePay = async () => {
    if (!amount) return alert('Enter amount');
    setPaying(true);
    try {
      const token = localStorage.getItem('token');
      // user-scoped pay uses card_id
      const res = await api.payWithMyCard(token, { card_id: card.id, amount: parseFloat(amount) });
      alert(res?.message || `Payment successful. New balance: ${res?.balance || res?.new_balance}`);
      setAmount('');
      onUpdated && onUpdated();
    } catch (err) {
      alert(err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-400">UID</div>
          <div className="font-mono">{card.uid}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Balance</div>
          <div className="font-semibold">{card.balance?.toFixed?.(2) ?? card.balance}</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <input className="flex-1 p-2 rounded bg-gray-900 border border-gray-700" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
        <button disabled={paying} onClick={handlePay} className="px-4 py-2 bg-cyan-600 rounded disabled:opacity-50">{paying ? 'Processing...' : 'Pay'}</button>
      </div>
    </div>
  );
};

CardItem.propTypes = {
  card: PropTypes.object.isRequired,
  onUpdated: PropTypes.func,
};

export default CardItem;
