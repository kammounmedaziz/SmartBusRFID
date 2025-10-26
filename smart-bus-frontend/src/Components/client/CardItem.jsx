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
    <div className="p-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl hover:bg-white/15 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-300 uppercase tracking-wider">UID</div>
          <div className="font-mono font-semibold text-white">{card.uid}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-300 uppercase tracking-wider">Balance</div>
          <div className="font-semibold text-2xl text-white">{card.balance?.toFixed?.(2) ?? card.balance} T-Pay</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <input className="flex-1 p-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
        <button disabled={paying} onClick={handlePay} className="px-4 py-2 backdrop-blur-md bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 rounded-lg text-white font-medium disabled:opacity-50 transition-all duration-300">{paying ? 'Processing...' : 'Pay'}</button>
      </div>
    </div>
  );
};

CardItem.propTypes = {
  card: PropTypes.object.isRequired,
  onUpdated: PropTypes.func,
};

export default CardItem;
