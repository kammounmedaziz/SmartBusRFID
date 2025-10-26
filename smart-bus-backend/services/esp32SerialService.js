/**
 * ESP32 USB Serial Service
 * Handles communication with ESP32 via USB serial port
 * Processes RFID card scans and sends payment responses
 */

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import cardModel from '../models/cardModel.js';
import transactionModel from '../models/transactionModel.js';

class ESP32SerialService {
  constructor() {
    this.port = null;
    this.parser = null;
    this.isConnected = false;
    this.deviceInfo = {
      device_id: 'USB_DEVICE_001',
      location: 'Bus Terminal'
    };
    
    // Rate limiting map: {cardUID: lastPaymentTime}
    this.paymentCooldowns = new Map();
    this.cooldownSeconds = parseInt(process.env.PAYMENT_COOLDOWN) || 60;
    
    // Default fare
    this.defaultFare = parseFloat(process.env.DEFAULT_FARE) || 50;
  }

  /**
   * List all available serial ports
   */
  async listPorts() {
    try {
      const ports = await SerialPort.list();
      console.log('\n📋 Available Serial Ports:');
      ports.forEach((port, index) => {
        console.log(`   ${index + 1}. ${port.path}`);
        if (port.manufacturer) console.log(`      Manufacturer: ${port.manufacturer}`);
        if (port.serialNumber) console.log(`      Serial: ${port.serialNumber}`);
        if (port.vendorId) console.log(`      VID: ${port.vendorId}`);
      });
      return ports;
    } catch (error) {
      console.error('❌ Error listing ports:', error);
      return [];
    }
  }

  /**
   * Connect to ESP32 on specified port
   * @param {string} portPath - Serial port path (e.g., 'COM3' on Windows, '/dev/ttyUSB0' on Linux)
   * @param {number} baudRate - Baud rate (default: 115200)
   */
  async connect(portPath, baudRate = 115200) {
    try {
      console.log(`\n🔌 Connecting to ESP32 on ${portPath} at ${baudRate} baud...`);

      this.port = new SerialPort({
        path: portPath,
        baudRate: baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

      // Connection opened
      this.port.on('open', () => {
        console.log('✅ Serial port opened successfully');
        this.isConnected = true;
        
        // Send ping to check connection
        setTimeout(() => {
          this.sendCommand({ type: 'ping' });
        }, 2000);
      });

      // Handle incoming data
      this.parser.on('data', (line) => {
        this.handleIncomingMessage(line);
      });

      // Handle errors
      this.port.on('error', (err) => {
        console.error('❌ Serial port error:', err.message);
        this.isConnected = false;
      });

      // Handle close
      this.port.on('close', () => {
        console.log('🔌 Serial port closed');
        this.isConnected = false;
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to connect to ESP32:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Handle incoming messages from ESP32
   */
  async handleIncomingMessage(message) {
    try {
      message = message.trim();
      if (!message) return;

      // Parse JSON message
      const data = JSON.parse(message);
      
      console.log(`\n📨 Received from ESP32:`, data);

      // Handle different message types
      switch (data.type) {
        case 'ready':
          console.log('✅ ESP32 is ready');
          this.sendCommand({ type: 'config', defaultFare: this.defaultFare });
          break;

        case 'scan':
          // Card scanned - process payment
          await this.processCardScan(data.uid);
          break;

        case 'pong':
          console.log('🏓 Pong received - connection OK');
          break;

        case 'error':
          console.error('❌ ESP32 Error:', data.message);
          break;

        default:
          console.log('ℹ️  Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error.message);
      console.log('   Raw message:', message);
    }
  }

  /**
   * Process RFID card scan and payment
   */
  async processCardScan(uid) {
    console.log(`\n💳 Processing card: ${uid}`);

    try {
      // Check rate limiting
      const now = Date.now();
      const lastPayment = this.paymentCooldowns.get(uid);
      
      if (lastPayment) {
        const timeSinceLastPayment = (now - lastPayment) / 1000;
        const remainingCooldown = this.cooldownSeconds - timeSinceLastPayment;
        
        if (remainingCooldown > 0) {
          console.log(`⏳ Rate limited: ${Math.ceil(remainingCooldown)}s remaining`);
          this.sendCommand({
            type: 'error',
            message: `Please wait ${Math.ceil(remainingCooldown)} seconds`,
            error_code: 'RATE_LIMITED'
          });
          return;
        }
      }

      // Get card info
      const card = await cardModel.findByUID(uid);
      
      if (!card) {
        console.log('❌ Card not found');
        this.sendCommand({
          type: 'error',
          message: 'Card not found in system',
          error_code: 'CARD_NOT_FOUND'
        });
        return;
      }

      console.log(`👤 Card holder: ${card.user_name}`);
      console.log(`💰 Balance: ${card.balance} T-Pay`);
      console.log(`📋 Status: ${card.status}`);

      // Check card status
      if (card.status !== 'active') {
        console.log('❌ Card is blocked');
        this.sendCommand({
          type: 'error',
          message: 'Card is blocked',
          error_code: 'CARD_BLOCKED'
        });
        return;
      }

      // Check balance
      if (card.balance < this.defaultFare) {
        const shortage = this.defaultFare - card.balance;
        console.log(`❌ Insufficient balance (shortage: ${shortage.toFixed(2)})`);
        this.sendCommand({
          type: 'error',
          message: `Insufficient balance. Need ${shortage.toFixed(2)} T-Pay more`,
          error_code: 'INSUFFICIENT_BALANCE',
          shortage: shortage
        });
        return;
      }

      // Process payment
      const transaction = await transactionModel.createPayment({
        card_id: card.id,
        fare: this.defaultFare,
        payment_method: 'card',
        status: 'approved',
        device_id: this.deviceInfo.device_id,
        location: this.deviceInfo.location
      });

      // Update cooldown
      this.paymentCooldowns.set(uid, now);

      // Send success response
      console.log('✅ Payment successful!');
      console.log(`   Transaction ID: ${transaction.id}`);
      console.log(`   New balance: ${transaction.new_balance} T-Pay`);

      this.sendCommand({
        type: 'success',
        message: 'Payment successful',
        transaction: {
          id: transaction.id,
          card_holder: card.user_name,
          fare_charged: this.defaultFare,
          new_balance: transaction.new_balance,
          timestamp: transaction.payment_date
        }
      });

    } catch (error) {
      console.error('❌ Error processing payment:', error);
      this.sendCommand({
        type: 'error',
        message: 'System error. Please try again',
        error_code: 'SYSTEM_ERROR'
      });
    }
  }

  /**
   * Send command to ESP32
   */
  sendCommand(data) {
    if (!this.isConnected || !this.port) {
      console.error('❌ Cannot send command - not connected');
      return false;
    }

    try {
      const message = JSON.stringify(data) + '\n';
      this.port.write(message, (err) => {
        if (err) {
          console.error('❌ Error sending command:', err.message);
        } else {
          console.log('📤 Sent to ESP32:', data);
        }
      });
      return true;
    } catch (error) {
      console.error('❌ Error sending command:', error.message);
      return false;
    }
  }

  /**
   * Disconnect from ESP32
   */
  disconnect() {
    if (this.port && this.port.isOpen) {
      this.port.close((err) => {
        if (err) {
          console.error('❌ Error closing port:', err.message);
        } else {
          console.log('✅ Disconnected from ESP32');
        }
      });
    }
    this.isConnected = false;
  }

  /**
   * Update device configuration
   */
  updateConfig(config) {
    if (config.device_id) this.deviceInfo.device_id = config.device_id;
    if (config.location) this.deviceInfo.location = config.location;
    if (config.defaultFare) this.defaultFare = parseFloat(config.defaultFare);
    if (config.cooldownSeconds) this.cooldownSeconds = parseInt(config.cooldownSeconds);
    
    console.log('✅ Configuration updated:', {
      device_id: this.deviceInfo.device_id,
      location: this.deviceInfo.location,
      defaultFare: this.defaultFare,
      cooldownSeconds: this.cooldownSeconds
    });
  }
}

// Create singleton instance
const esp32Service = new ESP32SerialService();

export default esp32Service;
