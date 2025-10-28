import { useState } from 'react';
import { Search, CreditCard, Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/apiClient';

const CardTester = () => {
  const [cardUid, setCardUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScanRFID = async () => {
    setScanning(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const scanResult = await api.scanCardWithRFID(token, 30000); // 30 second timeout

      if (scanResult.success && scanResult.uid) {
        setCardUid(scanResult.uid);
        // Auto-test the card after scanning
        await testCard(scanResult.uid);
      } else {
        setError('Failed to scan card');
      }
    } catch (err) {
      if (err.status === 503) {
        setError('❌ ESP32 RFID reader not connected.\nPlease ensure the ESP32 is connected via USB.');
      } else if (err.status === 408) {
        setError('⏰ Scan timeout.\nNo card was detected within 30 seconds.\nPlease try again.');
      } else if (err.status === 409) {
        setError('⚠️ A scan is already in progress.\nPlease wait and try again.');
      } else {
        setError(err.message || 'Failed to scan card');
      }
    } finally {
      setScanning(false);
    }
  };

  const testCard = async (uid = cardUid) => {
    if (!uid) {
      setError('Please enter a card UID or scan a card');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await api.testCard(token, uid);

      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to test card');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    testCard();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `${amount} T-Pay`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Search className="w-6 h-6 text-blue-600" />
        Card Tester
      </h2>

      {/* Scan Card Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleScanRFID}
          disabled={scanning || loading}
          className={`w-full py-3 mb-4 backdrop-blur-md border rounded-lg text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            scanning
              ? 'bg-yellow-500/30 border-yellow-400/50 cursor-wait'
              : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/40 hover:to-purple-500/40 border-blue-400/50'
          }`}
        >
          {scanning ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Scanning... (30s)</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Scan Card with RFID</span>
            </>
          )}
        </button>

        {scanning && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            <p className="font-semibold">📡 Waiting for card...</p>
            <p className="text-xs mt-1">Place your RFID card on the reader</p>
          </div>
        )}
      </div>

      {/* Manual UID Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={cardUid}
              onChange={(e) => setCardUid(e.target.value)}
              placeholder="Card UID (or scan above)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={scanning || loading}
            />
            {cardUid && (
              <button
                type="button"
                onClick={() => setCardUid('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || scanning || !cardUid}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Test Card</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Error</p>
          </div>
          <p className="text-red-700 mt-1 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Test Results */}
      {result && (
        <div className="space-y-6">
          {/* Card Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Card Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">UID</p>
                <p className="font-mono font-medium">{result.card.uid}</p>
              </div>
              <div>
                <p className="text-gray-600">Balance</p>
                <p className="font-bold text-green-600">{formatCurrency(result.card.balance)}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className={`font-medium ${result.card.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {result.card.status}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="text-xs">{formatDate(result.card.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Last Ticket Paid */}
          {result.last_ticket && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-300 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
                💳 Last Ticket Paid by User
              </h3>
              
              {/* Ticket Number & Status */}
              <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600">Ticket Number</p>
                    <p className="font-mono font-bold text-lg text-purple-700">{result.last_ticket.ticket_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      result.last_ticket.status === 'booked' ? 'bg-blue-100 text-blue-700' : 
                      result.last_ticket.status === 'used' ? 'bg-green-100 text-green-700' : 
                      result.last_ticket.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {result.last_ticket.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600 mb-2">Route</p>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-gray-800">{result.last_ticket.trip.from_city}</p>
                    <p className="text-xs text-gray-500">{result.last_ticket.trip.departure_time}</p>
                  </div>
                  <div className="px-4">
                    <div className="flex items-center gap-2 text-purple-600">
                      <div className="h-0.5 w-8 bg-purple-600"></div>
                      <MapPin className="w-5 h-5" />
                      <div className="h-0.5 w-8 bg-purple-600"></div>
                    </div>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-gray-800">{result.last_ticket.trip.to_city}</p>
                    <p className="text-xs text-gray-500">{result.last_ticket.trip.arrival_time}</p>
                  </div>
                </div>
                {result.last_ticket.trip.bus_type && (
                  <div className="mt-2 text-center">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {result.last_ticket.trip.bus_type.toUpperCase()} BUS
                    </span>
                  </div>
                )}
              </div>

              {/* Payment & Travel Details */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-gray-600 text-xs mb-1">Amount Paid</p>
                  <p className="font-bold text-green-600 text-lg">{formatCurrency(result.last_ticket.amount_paid)}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-gray-600 text-xs mb-1">Trip Price</p>
                  <p className="font-bold text-blue-600 text-lg">{formatCurrency(result.last_ticket.trip.price)}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-gray-600 text-xs mb-1">Travel Date</p>
                  <p className="font-medium text-gray-800">{new Date(result.last_ticket.travel_date).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-gray-600 text-xs mb-1">Seat Number</p>
                  <p className="font-medium text-gray-800">{result.last_ticket.seat_number || 'Not Assigned'}</p>
                </div>
              </div>

              {/* Passenger Information */}
              {(result.last_ticket.passenger_name || result.last_ticket.passenger_phone) && (
                <div className="p-3 bg-white rounded-lg border border-purple-200 mb-4">
                  <p className="text-xs text-gray-600 mb-2">Passenger Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {result.last_ticket.passenger_name && (
                      <div>
                        <p className="text-gray-600 text-xs">Name</p>
                        <p className="font-medium">{result.last_ticket.passenger_name}</p>
                      </div>
                    )}
                    {result.last_ticket.passenger_phone && (
                      <div>
                        <p className="text-gray-600 text-xs">Phone</p>
                        <p className="font-medium">{result.last_ticket.passenger_phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Purchase & Validation Info */}
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-2 bg-white rounded border border-purple-200">
                  <p className="text-gray-600">Purchase Date</p>
                  <p className="font-medium text-gray-800">{formatDate(result.last_ticket.purchase_date)}</p>
                </div>
                {result.last_ticket.validation_time && (
                  <div className="p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-gray-600">✓ Validated</p>
                    <p className="font-medium text-green-800">{formatDate(result.last_ticket.validation_time)}</p>
                    {result.last_ticket.validated_by && (
                      <p className="text-xs text-green-700 mt-1">By: {result.last_ticket.validated_by}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Validation */}
          {result.last_validation && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Last Ticket Validation
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Fare Deducted</p>
                  <p className="font-bold text-red-600">-{formatCurrency(result.last_validation.fare_amount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className={`font-medium ${result.last_validation.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {result.last_validation.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {result.last_validation.location}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Controller</p>
                  <p className="text-xs">{result.last_validation.controller_name || 'Unknown'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Validation Date</p>
                  <p className="text-xs">{formatDate(result.last_validation.created_at)}</p>
                </div>
              </div>
            </div>
          )}

          {/* No History Message */}
          {!result.last_transaction && !result.last_ticket && !result.last_validation && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">No Activity History</p>
              </div>
              <p className="text-yellow-700 mt-1">This card has no recorded transactions, tickets, or validations yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardTester;