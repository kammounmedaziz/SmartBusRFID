import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Bus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RouteSelector from '../../Components/booking/RouteSelector';
import TripList from '../../Components/booking/TripList';
import CardPayment from '../../Components/booking/CardPayment';
import CardScanner from '../../Components/booking/CardScanner';
import TicketConfirmation from '../../Components/booking/TicketConfirmation';

const AnimatedBackground = () => {
  const blobRefs = useRef([]);

  useEffect(() => {
    const initialPositions = [
      { x: -4, y: 0 },
      { x: -4, y: 0 },
      { x: 20, y: -8 },
      { x: 20, y: -8 },
    ];
    let requestId;

    const handleScroll = () => {
      const newScroll = window.pageYOffset;

      blobRefs.current.forEach((blob, index) => {
        if (!blob) return;
        const initialPos = initialPositions[index];

        const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340;
        const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40;

        const x = initialPos.x + xOffset;
        const y = initialPos.y + yOffset;

        blob.style.transform = `translate(${x}px, ${y}px)`;
        blob.style.transition = 'transform 1.4s ease-out';
      });

      requestId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(requestId);
    };
  }, []);

  return (
    <div className="fixed inset-0 animated-bg">
      <div className="absolute inset-0">
        <div
          ref={(ref) => (blobRefs.current[0] = ref)}
          className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15"
        ></div>
        <div
          ref={(ref) => (blobRefs.current[1] = ref)}
          className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 hidden sm:block"
        ></div>
        <div
          ref={(ref) => (blobRefs.current[2] = ref)}
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-cyan-700 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15"
        ></div>
        <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-gray-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"
        ></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  );
};

const GuestBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [travelDate, setTravelDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [passengerInfo, setPassengerInfo] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setStep(2);
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setStep(3);
  };

  const handleProceedToScan = (info) => {
    setPassengerInfo(info);
    setStep(4);
  };

  const handleScanSuccess = (result) => {
    setBookingResult(result);
    setStep(5);
  };

  const handleScanCancel = () => {
    setStep(3);
    setPassengerInfo(null);
  };

  const handleNewBooking = () => {
    setStep(1);
    setSelectedRoute(null);
    setSelectedTrip(null);
    setPassengerInfo(null);
    setBookingResult(null);
    setTravelDate(new Date().toISOString().split('T')[0]);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) {
        setSelectedRoute(null);
      }
      if (step === 3) {
        setSelectedTrip(null);
      }
      if (step === 4) {
        setPassengerInfo(null);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/50">
              <Bus className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Book Your Trip
              </h1>
              <p className="text-gray-400 mt-1">
                Pay securely with your RFID card
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[
              { num: 1, label: 'Route' },
              { num: 2, label: 'Trip' },
              { num: 3, label: 'Details' },
              { num: 4, label: 'Scan' },
              { num: 5, label: 'Confirm' },
            ].map((item, index) => (
              <div key={item.num} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= item.num
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-white/10 text-gray-500'
                  }`}
                >
                  {item.num}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step >= item.num ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
                {index < 3 && (
                  <div
                    className={`w-12 h-1 rounded-full transition-all duration-300 ${
                      step > item.num ? 'bg-cyan-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Route Selection */}
          {step === 1 && (
            <RouteSelector
              onRouteSelect={handleRouteSelect}
              selectedRoute={selectedRoute}
            />
          )}

          {/* Step 2: Trip Selection */}
          {step === 2 && selectedRoute && (
            <div className="space-y-4">
              <button
                onClick={handleBack}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Change route
              </button>
              <TripList
                route={selectedRoute}
                onSelectTrip={handleTripSelect}
                selectedTrip={selectedTrip}
              />
            </div>
          )}

          {/* Step 3: Travel Date & Passenger Info */}
          {step === 3 && selectedTrip && (
            <div className="space-y-4">
              <button
                onClick={handleBack}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Change trip
              </button>

              {/* Travel Date */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
                <label className="block text-gray-300 mb-2 font-medium">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>

              <CardPayment
                trip={selectedTrip}
                travelDate={travelDate}
                onProceedToScan={handleProceedToScan}
              />
            </div>
          )}

          {/* Step 4: Card Scanner */}
          {step === 4 && selectedTrip && passengerInfo && (
            <CardScanner
              trip={selectedTrip}
              travelDate={travelDate}
              passengerName={passengerInfo.passengerName}
              passengerPhone={passengerInfo.passengerPhone}
              onScanSuccess={handleScanSuccess}
              onCancel={handleScanCancel}
            />
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && bookingResult && (
            <TicketConfirmation
              ticket={bookingResult.ticket}
              trip={selectedTrip}
              onNewBooking={handleNewBooking}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestBooking;
