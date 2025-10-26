import dotenv from 'dotenv';

dotenv.config();

// ESP32 API Key validation middleware
export const validateESP32ApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['x-device-key'];
  const validKey = process.env.ESP32_API_KEY || 'smartbus-esp32-2025';
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error_code: 'API_KEY_MISSING',
      message: 'API key required in X-API-Key header'
    });
  }
  
  if (apiKey !== validKey) {
    console.warn('⚠️  Invalid ESP32 API key attempt:', apiKey);
    return res.status(401).json({
      success: false,
      error_code: 'INVALID_API_KEY',
      message: 'Invalid API key'
    });
  }
  
  // Optional: Track device info
  req.device = {
    mac: req.headers['x-device-mac'] || 'unknown',
    id: req.headers['x-device-id'] || 'unknown',
    ip: req.ip || req.connection.remoteAddress
  };
  
  next();
};

// Optional: Device MAC whitelist validation
export const validateDeviceMAC = (req, res, next) => {
  const allowedDevices = (process.env.ALLOWED_ESP32_MACS || '').split(',').filter(Boolean);
  
  // If no whitelist configured, skip validation
  if (allowedDevices.length === 0) {
    return next();
  }
  
  const deviceMAC = req.headers['x-device-mac'];
  
  if (!deviceMAC) {
    return res.status(403).json({
      success: false,
      error_code: 'DEVICE_MAC_MISSING',
      message: 'Device MAC address required'
    });
  }
  
  if (!allowedDevices.includes(deviceMAC.toUpperCase())) {
    console.warn('⚠️  Unauthorized device MAC:', deviceMAC);
    return res.status(403).json({
      success: false,
      error_code: 'DEVICE_NOT_ALLOWED',
      message: 'Device not registered'
    });
  }
  
  next();
};

export default {
  validateESP32ApiKey,
  validateDeviceMAC
};
