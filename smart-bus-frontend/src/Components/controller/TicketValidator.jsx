import { useState } from 'react';

const TicketValidator = () => {
  const [cardUid, setCardUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const handleValidate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/controller/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ card_uid: cardUid })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed');
      }

      setValidationResult(data);
      setSuccess(`Ticket validated successfully! Fare: ${data.fare_amount} DZD`);
      setCardUid('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Validate Ticket</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-medium">Validation Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-medium">Success!</p>
          <p className="text-sm mt-1">{success}</p>
        </div>
      )}

      {validationResult && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-3">Validation Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Card UID:</span>
              <p className="font-medium text-gray-900">{validationResult.card_uid}</p>
            </div>
            <div>
              <span className="text-gray-600">Passenger:</span>
              <p className="font-medium text-gray-900">{validationResult.user_name}</p>
            </div>
            <div>
              <span className="text-gray-600">Previous Balance:</span>
              <p className="font-medium text-gray-900">{validationResult.previous_balance} DZD</p>
            </div>
            <div>
              <span className="text-gray-600">New Balance:</span>
              <p className="font-medium text-green-600">{validationResult.new_balance} DZD</p>
            </div>
            <div>
              <span className="text-gray-600">Fare Deducted:</span>
              <p className="font-medium text-red-600">-{validationResult.fare_amount} DZD</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium text-green-600 capitalize">{validationResult.status}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleValidate} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Card UID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={cardUid}
            onChange={(e) => setCardUid(e.target.value)}
            required
            placeholder="Scan or enter card UID"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-2">
            Scan the passenger&apos;s RFID card or enter the UID manually
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !cardUid.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Validating...' : 'Validate Ticket'}
        </button>
      </form>
    </div>
  );
};

export default TicketValidator;
