import { CheckCircle2, Download, MapPin, Clock, Calendar, CreditCard, Ticket } from 'lucide-react';

const TicketConfirmation = ({ ticket, trip, onNewBooking }) => {
  if (!ticket || !trip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
        <p className="text-gray-300">Your ticket has been successfully booked</p>
      </div>

      {/* Ticket Details */}
      <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400 text-sm">Ticket Number</span>
          </div>
          <span className="text-white font-mono font-bold text-lg">{ticket.ticket_number}</span>
        </div>

        <div className="space-y-4">
          {/* Route */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-400 text-sm mb-1">Route</p>
              <p className="text-white font-semibold text-lg">
                {trip.from_city} → {trip.to_city}
              </p>
            </div>
          </div>

          {/* Travel Date */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-400 text-sm mb-1">Travel Date</p>
              <p className="text-white font-semibold">
                {new Date(ticket.travel_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Departure Time */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-400 text-sm mb-1">Departure Time</p>
              <p className="text-white font-semibold text-lg">
                {trip.departure_time.slice(0, 5)} - {trip.arrival_time.slice(0, 5)}
              </p>
              <p className="text-gray-400 text-sm">Duration: {trip.duration_minutes} minutes</p>
            </div>
          </div>

          {/* Amount Paid */}
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-400 text-sm mb-1">Amount Paid</p>
              <p className="text-white font-semibold text-xl">{ticket.amount_paid} TND</p>
            </div>
          </div>

          {/* Passenger Info */}
          {ticket.passenger_name && (
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-sm mb-1">Passenger Name</p>
                <p className="text-white font-semibold">{ticket.passenger_name}</p>
              </div>
            </div>
          )}

          {ticket.passenger_phone && (
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-sm mb-1">Phone Number</p>
                <p className="text-white font-semibold">{ticket.passenger_phone}</p>
              </div>
            </div>
          )}

          {/* Card UID */}
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-400 text-sm mb-1">Card UID</p>
              <p className="text-white font-mono">{ticket.card_uid}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 border border-green-500/50 text-green-300">
                {ticket.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Info */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
        <p className="text-cyan-200 text-sm font-medium mb-2">Important Information:</p>
        <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
          <li>Please arrive at the station 15 minutes before departure</li>
          <li>Keep your RFID card with you for validation</li>
          <li>This ticket is non-refundable and non-transferable</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 py-3 px-6 rounded-xl bg-white/5 border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Print Ticket
        </button>
        <button
          onClick={onNewBooking}
          className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
        >
          Book Another Ticket
        </button>
      </div>
    </div>
  );
};

export default TicketConfirmation;
