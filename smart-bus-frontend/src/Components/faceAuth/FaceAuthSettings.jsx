import { useState } from 'react';
import { Scan, ShieldCheck, ShieldOff, Camera, Info } from 'lucide-react';
import PropTypes from 'prop-types';
import FaceCapture from './FaceCapture';
import api from '../../utils/apiClient';

/**
 * FaceAuthSettings Component
 * Allows users to enable/disable face authentication
 */
const FaceAuthSettings = ({ token }) => {
  const [faceEnabled, setFaceEnabled] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleEnableFace = () => {
    setShowCamera(true);
    setMessage(null);
  };

  const handleFaceCapture = async (imageBase64) => {
    setShowCamera(false);
    setLoading(true);
    setMessage(null);

    try {
      await api.enableFaceAuth(token, imageBase64);
      setFaceEnabled(true);
      setMessage({ type: 'success', text: 'Face authentication enabled successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to enable face authentication' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableFace = async () => {
    if (!confirm('Are you sure you want to disable face authentication?')) return;

    setLoading(true);
    setMessage(null);

    try {
      await api.disableFaceAuth(token);
      setFaceEnabled(false);
      setMessage({ type: 'success', text: 'Face authentication disabled successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to disable face authentication' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500/10 rounded-lg">
          <Scan className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Face Authentication</h2>
          <p className="text-gray-400 text-sm">Secure login with facial recognition</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4 mb-6 flex gap-3">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="mb-2">Enable face authentication to log in quickly and securely without entering your password.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Works on devices with a camera</li>
            <li>Your face data is encrypted and stored securely</li>
            <li>You can still use password login anytime</li>
          </ul>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg mb-6">
        <div className="flex items-center gap-3">
          {faceEnabled ? (
            <>
              <ShieldCheck className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-white font-medium">Face Auth Enabled</p>
                <p className="text-gray-400 text-sm">You can log in using your face</p>
              </div>
            </>
          ) : (
            <>
              <ShieldOff className="w-6 h-6 text-gray-400" />
              <div>
                <p className="text-white font-medium">Face Auth Disabled</p>
                <p className="text-gray-400 text-sm">Password login only</p>
              </div>
            </>
          )}
        </div>
        <div className={`w-12 h-6 rounded-full transition-colors ${faceEnabled ? 'bg-green-500' : 'bg-gray-600'} relative`}>
          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${faceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/50 text-green-400'
            : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Action Button */}
      <div>
        {!faceEnabled ? (
          <button
            onClick={handleEnableFace}
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            {loading ? 'Processing...' : 'Enable Face Authentication'}
          </button>
        ) : (
          <button
            onClick={handleDisableFace}
            disabled={loading}
            className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShieldOff className="w-5 h-5" />
            {loading ? 'Processing...' : 'Disable Face Authentication'}
          </button>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <FaceCapture
          onCapture={handleFaceCapture}
          onCancel={() => setShowCamera(false)}
          title="Register Your Face"
        />
      )}
    </div>
  );
};

FaceAuthSettings.propTypes = {
  token: PropTypes.string.isRequired,
};

export default FaceAuthSettings;
