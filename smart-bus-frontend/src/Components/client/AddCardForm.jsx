import { useState } from 'react';
import api from '../../utils/apiClient';

const AddCardForm = () => {
  const [uid, setUid] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleScanRFID = async () => {
    setScanning(true);
    try {
      const token = localStorage.getItem('token');
      const result = await api.scanCardWithRFID(token, 30000); // 30 second timeout
      
      if (result.success && result.uid) {
        setUid(result.uid);
        alert(`✅ Card scanned successfully!\nUID: ${result.uid}`);
      } else {
        alert('Failed to scan card');
      }
    } catch (err) {
      if (err.status === 503) {
        alert('❌ ESP32 RFID reader not connected.\nPlease ensure the ESP32 is connected via USB.');
      } else if (err.status === 408) {
        alert('⏰ Scan timeout.\nNo card was detected within 30 seconds.\nPlease try again.');
      } else if (err.status === 409) {
        alert('⚠️ A scan is already in progress.\nPlease wait and try again.');
      } else {
        alert(err.message || 'Failed to scan card');
      }
    } finally {
      setScanning(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!uid) return alert('Enter card UID or scan with RFID reader');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { uid, balance: balance ? parseFloat(balance) : undefined };
      await api.createCardForMe(token, payload);
      alert('Card added successfully');
      setUid(''); 
      setBalance('');
      // trigger global refresh by dispatching a custom event
      window.dispatchEvent(new Event('cards:updated'));
    } catch (err) {
      alert(err.message || 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="p-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl">
      <h3 className="font-semibold mb-3 text-white">Add new card</h3>
      
      {/* RFID Scan Button */}
      <button
        type="button"
        onClick={handleScanRFID}
        disabled={scanning}
        className={`w-full py-3 mb-3 backdrop-blur-md border rounded-lg text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
          scanning 
            ? 'bg-yellow-500/30 border-yellow-400/50 cursor-wait' 
            : 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/40 hover:to-pink-500/40 border-purple-400/50'
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Scan Card with RFID</span>
          </>
        )}
      </button>

      {scanning && (
        <div className="mb-3 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg text-yellow-200 text-sm">
          <p className="font-semibold">📡 Waiting for card...</p>
          <p className="text-xs mt-1">Place your RFID card on the reader</p>
        </div>
      )}

      <div className="relative mb-2">
        <input 
          value={uid} 
          onChange={e => setUid(e.target.value)} 
          placeholder="Card UID (or scan above)" 
          className="w-full p-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          disabled={scanning}
        />
        {uid && (
          <button
            type="button"
            onClick={() => setUid('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      <input 
        value={balance} 
        onChange={e => setBalance(e.target.value)} 
        placeholder="Initial balance (optional)" 
        className="w-full p-2 mb-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        disabled={scanning}
      />

      <button 
        type="submit" 
        className="w-full py-2 backdrop-blur-md bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 rounded-lg text-white font-medium transition-all duration-300" 
        disabled={loading || scanning}
      >
        {loading ? 'Adding...' : 'Add Card'}
      </button>
    </form>
  );
};

export default AddCardForm;
