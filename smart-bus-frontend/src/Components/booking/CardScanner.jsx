import { useState, useEffect } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const CardScanner = ({ trip, travelDate, passengerName, passengerPhone, onScanSuccess, onCancel }) => {
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(30);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Auto-start scanning when component mounts
  useEffect(() => {
    scanAndPay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let timer;
    if (scanning && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (scanning && countdown === 0) {
      setError('Scan timeout. Please try again.');
      setScanning(false);
      setProcessing(false);
    }
    return () => clearTimeout(timer);
  }, [scanning, countdown]);

  const scanAndPay = async () => {
    try {
      setScanning(true);
      setProcessing(true);
      setError(null);
      setCountdown(30);

      console.log('🎫 Starting card scan and payment...');

      const response = await axios.post(`${API_BASE_URL}/api/tickets/book-guest`, {
        tripId: trip.id,
        travelDate,
        passengerName: passengerName || 'Guest',
        passengerPhone: passengerPhone || '',
        timeout: 30000
      });

      if (response.data.success) {
        console.log('✅ Payment successful!', response.data);
        setScanning(false);
        setProcessing(false);
        onScanSuccess(response.data);
      }
    } catch (err) {
      setScanning(false);
      setProcessing(false);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to process payment. Please try again.';
      setError(errorMessage);
      
      console.error('❌ Payment error:', errorMessage);
    }
  };

  const handleCancel = () => {
    setScanning(false);
    setProcessing(false);
    setError(null);
    onCancel();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-cyan-500/20 border border-cyan-500/50 mb-4">
            <CreditCard className="w-12 h-12 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Scan Your Card</h2>
          <p className="text-gray-400">
            Place your RFID card near the reader to complete payment
          </p>
        </div>

        {/* Trip Details Summary */}
        <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Trip Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Route:</span>
              <span className="font-medium text-white">
                {trip.from_city} → {trip.to_city}
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Date:</span>
              <span className="font-medium text-white">{travelDate}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Departure:</span>
              <span className="font-medium text-white">{trip.departure_time}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Price:</span>
              <span className="font-bold text-cyan-400 text-lg">{trip.price} TND</span>
            </div>
          </div>
        </div>

        {/* Scanner Status */}
        <div className="space-y-6">
          {/* Scanning State - Auto-started */}
          {scanning && !error && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg font-semibold mb-2">
                Waiting for card...
              </p>
              <p className="text-gray-400 mb-4">
                Please place your RFID card near the reader
              </p>
              <div className="text-cyan-400 text-2xl font-bold mb-2">
                {countdown}s
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Processing payment automatically after scan...
              </p>
              <button
                onClick={handleCancel}
                className="mt-6 px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="space-y-4">
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold">Error</p>
                  <p className="text-gray-300 text-sm mt-1">{error}</p>
                </div>
              </div>
              
              {/* Try Again Button */}
              <button
                onClick={() => {
                  setError(null);
                  scanAndPay();
                }}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
              >
                <CreditCard className="w-6 h-6" />
                Try Again
              </button>
            </div>
          )}

          {/* Cancel Button - Only show when not scanning */}
          {!scanning && (
            <button
              onClick={handleCancel}
              className="w-full py-3 px-6 text-gray-400 hover:text-white transition-colors border border-white/20 rounded-xl hover:border-white/40"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardScanner;
