import { useState } from 'react';
import { Settings, DollarSign, Clock, MapPin, Save } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    baseFare: 25,
    minimumBalance: 10,
    maxDailyValidations: 50,
    cardExpiryDays: 365,
    autoApprovePayments: false,
    requireControllerApproval: true,
  });

  const handleSave = () => {
    // TODO: Implement save to backend
    alert('Settings saved! (Backend integration pending)');
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-7 h-7" />
            System Settings
          </h2>
          <p className="text-gray-300 mt-1">Configure system-wide parameters and policies</p>
        </div>

        <div className="space-y-6">
          {/* Fare Settings */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Fare Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Base Fare (T-Pay)
                </label>
                <input
                  type="number"
                  value={settings.baseFare}
                  onChange={(e) => setSettings({ ...settings, baseFare: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 backdrop-blur-md bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Minimum Balance Required (T-Pay)
                </label>
                <input
                  type="number"
                  value={settings.minimumBalance}
                  onChange={(e) => setSettings({ ...settings, minimumBalance: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 backdrop-blur-md bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Validation Settings */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Validation Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Max Daily Validations per Card
                </label>
                <input
                  type="number"
                  value={settings.maxDailyValidations}
                  onChange={(e) => setSettings({ ...settings, maxDailyValidations: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 backdrop-blur-md bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Card Expiry (Days)
                </label>
                <input
                  type="number"
                  value={settings.cardExpiryDays}
                  onChange={(e) => setSettings({ ...settings, cardExpiryDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 backdrop-blur-md bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Payment & Approval Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-white font-medium">Auto-approve Manual Payments</p>
                  <p className="text-gray-400 text-sm">Automatically approve payments without operator review</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoApprovePayments}
                    onChange={(e) => setSettings({ ...settings, autoApprovePayments: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-white font-medium">Require Controller Approval</p>
                  <p className="text-gray-400 text-sm">Controllers must approve ticket validations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireControllerApproval}
                    onChange={(e) => setSettings({ ...settings, requireControllerApproval: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="backdrop-blur-md bg-green-500/30 hover:bg-green-500/40 text-white px-6 py-3 rounded-lg border border-green-400/50 flex items-center gap-2 transition-all duration-200"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-gray-400 text-sm">System Version</p>
            <p className="text-white font-semibold text-lg">v1.0.0</p>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Database Status</p>
            <p className="text-green-400 font-semibold text-lg">Connected</p>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Last Backup</p>
            <p className="text-white font-semibold text-lg">Not configured</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
