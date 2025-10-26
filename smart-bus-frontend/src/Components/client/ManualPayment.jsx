import { useState, useEffect } from 'react';
import { Wallet, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ManualPayment = () => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedCard, setSelectedCard] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [userCards, setUserCards] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchUserCards();
  }, []);

  const fetchUserCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cards/my-cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      
      const result = await response.json();
      const cards = result.data || result || [];
      setUserCards(Array.isArray(cards) ? cards : []);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load your cards');
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/manual-payments/my-payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      const result = await response.json();
      const payments = result.data || result || [];
      setPayments(Array.isArray(payments) ? payments : []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (paymentMethod === 'card' && !selectedCard) {
      setError('Please select a card for payment');
      setLoading(false);
      return;
    }

    if (paymentMethod === 'cash' && !operatorName.trim()) {
      setError('Please enter the operator name who handled your payment');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        notes: notes || null
      };

      // Add card_id if payment method is card
      if (paymentMethod === 'card') {
        payload.card_id = parseInt(selectedCard);
      }

      // Add operator_name if payment method is cash
      if (paymentMethod === 'cash') {
        payload.operator_name = operatorName.trim();
      }

      const response = await fetch('http://localhost:5000/api/manual-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment request');
      }

      if (paymentMethod === 'cash') {
        setSuccess('Cash payment request submitted! An operator will verify your payment shortly.');
      } else {
        setSuccess('Card payment completed successfully!');
        // Trigger event to refresh cards and transactions
        window.dispatchEvent(new Event('cards:updated'));
      }
      
      setAmount('');
      setSelectedCard('');
      setOperatorName('');
      setNotes('');
      fetchPayments();
      fetchUserCards(); // Refresh cards to show updated balance
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Payment Form */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Manual Payment Request</h2>
        <div className="mb-6 p-4 backdrop-blur-md bg-blue-500/20 border border-blue-400/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Currency Information</p>
              <p className="text-blue-200 text-xs">1 DT (Dinar) = 1 T-Pay coin</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 backdrop-blur-md bg-red-500/20 border border-red-400/30 text-red-100 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 backdrop-blur-md bg-green-500/20 border border-green-400/30 text-green-100 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-200 font-medium mb-2">
              Amount (T-Pay) <span className="text-red-300">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter amount in T-Pay"
            />
          </div>

          <div>
            <label className="block text-gray-200 font-medium mb-3">
              Payment Method <span className="text-red-300">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  paymentMethod === 'cash'
                    ? 'backdrop-blur-md bg-cyan-500/30 border-cyan-400/70 shadow-lg shadow-cyan-500/20'
                    : 'backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/15'
                }`}
              >
                <Wallet className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'cash' ? 'text-cyan-300' : 'text-gray-300'}`} />
                <p className={`font-medium ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-300'}`}>Cash</p>
                <p className="text-xs text-gray-400 mt-1">Operator verification required</p>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  paymentMethod === 'card'
                    ? 'backdrop-blur-md bg-cyan-500/30 border-cyan-400/70 shadow-lg shadow-cyan-500/20'
                    : 'backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/15'
                }`}
              >
                <CreditCard className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-cyan-300' : 'text-gray-300'}`} />
                <p className={`font-medium ${paymentMethod === 'card' ? 'text-white' : 'text-gray-300'}`}>Card</p>
                <p className="text-xs text-gray-400 mt-1">Use your RFID card</p>
              </button>
            </div>
          </div>

          {/* Card Selection (only shown when card payment is selected) */}
          {paymentMethod === 'card' && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
              <label className="block text-gray-200 font-medium mb-3">
                Select Card <span className="text-red-300">*</span>
              </label>
              {userCards.length === 0 ? (
                <p className="text-gray-400 text-sm">No cards available. Please add a card first.</p>
              ) : (
                <div className="space-y-2">
                  {userCards.map((card) => (
                    <label
                      key={card.id}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        selectedCard === card.id.toString()
                          ? 'backdrop-blur-md bg-cyan-500/20 border-cyan-400/50'
                          : 'backdrop-blur-md bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="card"
                        value={card.id}
                        checked={selectedCard === card.id.toString()}
                        onChange={(e) => setSelectedCard(e.target.value)}
                        className="mr-3 accent-cyan-500"
                      />
                      <div className="flex-1">
                        <p className="font-mono text-white font-medium">{card.uid}</p>
                        <p className="text-sm text-gray-300">Balance: {card.balance} T-Pay</p>
                      </div>
                      {card.status === 'active' ? (
                        <span className="px-2 py-1 bg-green-500/30 border border-green-400/50 text-green-100 text-xs rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-500/30 border border-red-400/50 text-red-100 text-xs rounded-full">Inactive</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Operator Name (only shown when cash payment is selected) */}
          {paymentMethod === 'cash' && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
              <label className="block text-gray-200 font-medium mb-2">
                Operator Name <span className="text-red-300">*</span>
              </label>
              <p className="text-sm text-gray-400 mb-3">Enter the name of the operator who handled your cash payment</p>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                required={paymentMethod === 'cash'}
                className="w-full px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="e.g., John Doe"
              />
            </div>
          )}

          {/* Cash Payment Info */}
          {paymentMethod === 'cash' && (
            <div className="backdrop-blur-md bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-100 font-medium mb-1">Cash Payment Process</p>
                  <p className="text-yellow-200 text-sm">
                    After submitting, an operator will verify your cash payment. You&apos;ll be notified in real-time when the payment is verified or rejected.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-200 font-medium mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Additional information about the payment"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full backdrop-blur-md bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Payment Request'}
          </button>
        </form>
      </div>

      {/* Payment History */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Payment History</h2>
        
        {payments.length === 0 ? (
          <p className="text-gray-300 text-center py-8">No payment requests yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="backdrop-blur-md bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Operator/Card
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
                      {payment.amount} T-Pay
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        payment.payment_method === 'cash' 
                          ? 'backdrop-blur-md bg-green-500/30 text-green-100 border border-green-400/50' 
                          : 'backdrop-blur-md bg-blue-500/30 text-blue-100 border border-blue-400/50'
                      }`}>
                        {payment.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {payment.payment_method === 'cash' 
                        ? (payment.operator_name || 'N/A')
                        : (payment.card_uid || 'Card Payment')
                      }
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

export default ManualPayment;
