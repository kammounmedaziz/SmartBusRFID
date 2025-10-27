import { useState, useEffect } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import axios from 'axios';

const RouteSelector = ({ onRouteSelect, selectedRoute }) => {
  const [cities, setCities] = useState([]);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/trips/cities`);
      if (response.data.success) {
        setCities(response.data.cities);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (fromCity && toCity) {
      if (fromCity === toCity) {
        setError('Departure and destination cities must be different');
        return;
      }
      onRouteSelect({ from: fromCity, to: toCity });
      setError(null);
    } else {
      setError('Please select both departure and destination cities');
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-cyan-400" />
        Select Your Route
      </h2>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* From City */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">From</label>
          <select
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
          >
            <option value="" className="bg-gray-800">Select departure city</option>
            {cities.map((city) => (
              <option key={city} value={city} className="bg-gray-800">
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* To City */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">To</label>
          <select
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
          >
            <option value="" className="bg-gray-800">Select destination city</option>
            {cities.map((city) => (
              <option key={city} value={city} className="bg-gray-800">
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200">
          {error}
        </div>
      )}

      <button
        onClick={handleSearch}
        disabled={!fromCity || !toCity}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50"
      >
        Search Trips
        <ArrowRight className="w-5 h-5" />
      </button>

      {selectedRoute && (
        <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <p className="text-cyan-300 text-center font-medium">
            {selectedRoute.from} → {selectedRoute.to}
          </p>
        </div>
      )}
    </div>
  );
};

export default RouteSelector;
