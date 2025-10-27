import { useState } from 'react';
import { CreditCard, User, Phone, ArrowRight } from 'lucide-react';

const CardPayment = ({ trip, travelDate, onProceedToScan }) => {
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');

  const handleProceed = () => {
    onProceedToScan({
      passengerName: passengerName || 'Guest',
      passengerPhone: passengerPhone || ''
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50">
          <CreditCard className="w-6 h-6 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Passenger Information</h2>
      </div>

      <div className="space-y-4 mb-6">
        {/* Passenger Name */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Passenger Name (Optional)
          </label>
          <input
            type="text"
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            placeholder="Enter passenger name"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        {/* Passenger Phone */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={passengerPhone}
            onChange={(e) => setPassengerPhone(e.target.value)}
            placeholder="+216 XX XXX XXX"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Trip Summary */}
      <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Trip Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Route:</span>
            <span className="font-medium text-white">{trip.from_city} → {trip.to_city}</span>
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
            <span>Bus Type:</span>
            <span className="font-medium text-white capitalize">{trip.bus_type}</span>
          </div>
          <div className="border-t border-white/10 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-300 font-semibold">Total Amount:</span>
              <span className="font-bold text-cyan-400 text-xl">{trip.price} TND</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed to Scan Button */}
      <button
        onClick={handleProceed}
        className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
      >
        <CreditCard className="w-6 h-6" />
        Proceed to Card Scan
        <ArrowRight className="w-5 h-5" />
      </button>

      <p className="text-gray-400 text-sm text-center mt-4">
        You will be redirected to scan your RFID card
      </p>
    </div>
  );
};

export default CardPayment;
