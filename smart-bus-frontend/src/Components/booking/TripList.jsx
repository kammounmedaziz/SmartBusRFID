import { useState, useEffect } from 'react';
import { Clock, Bus, DollarSign, Users } from 'lucide-react';
import axios from 'axios';

const TripList = ({ route, onSelectTrip, selectedTrip }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (route) {
      fetchTrips();
    }
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/trips/route`, {
        params: {
          from: route.from,
          to: route.to
        }
      });

      if (response.data.success) {
        setTrips(response.data.trips);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  if (!route) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
        <p className="text-gray-400 text-center">No trips found for this route.</p>
      </div>
    );
  }

  const getBusTypeColor = (type) => {
    switch (type) {
      case 'express':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
      case 'luxury':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
      default:
        return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Bus className="w-6 h-6 text-cyan-400" />
        Available Trips
      </h2>

      <div className="space-y-4">
        {trips.map((trip) => (
          <div
            key={trip.id}
            onClick={() => onSelectTrip(trip)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              selectedTrip?.id === trip.id
                ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/30'
                : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-cyan-500/50'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBusTypeColor(trip.bus_type)}`}>
                    {trip.bus_type.toUpperCase()}
                  </span>
                  {trip.available_seats < 10 && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 border border-red-500/50 text-red-300">
                      Only {trip.available_seats} seats left
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold">{trip.departure_time.slice(0, 5)}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold">{trip.arrival_time.slice(0, 5)}</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    ({trip.duration_minutes} min)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>{trip.available_seats} seats</span>
                </div>

                <div className="flex items-center gap-2 text-white">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  <span className="text-2xl font-bold">{trip.price}</span>
                  <span className="text-gray-400">TND</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripList;
