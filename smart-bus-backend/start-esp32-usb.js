/**
 * ESP32 USB Connection Manager
 * Run this script to start the ESP32 serial communication service
 * 
 * Usage:
 *   node start-esp32-usb.js [PORT]
 * 
 * Examples:
 *   Windows: node start-esp32-usb.js COM3
 *   Linux:   node start-esp32-usb.js /dev/ttyUSB0
 *   Mac:     node start-esp32-usb.js /dev/cu.usbserial-0001
 * 
 * If no port is specified, the script will list available ports.
 */

import esp32Service from './services/esp32SerialService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log(`
╔════════════════════════════════════════════════╗
║   SmartBus ESP32 USB Serial Manager           ║
║   RFID Payment System - USB Version           ║
╚════════════════════════════════════════════════╝
`);

// Get port from command line argument
const portPath = process.argv[2];
const baudRate = process.argv[3] ? parseInt(process.argv[3]) : 115200;

async function main() {
  if (!portPath) {
    console.log('ℹ️  No port specified. Listing available ports...\n');
    await esp32Service.listPorts();
    console.log('\n💡 Usage: node start-esp32-usb.js [PORT] [BAUD_RATE]');
    console.log('   Example (Windows): node start-esp32-usb.js COM3');
    console.log('   Example (Linux):   node start-esp32-usb.js /dev/ttyUSB0');
    console.log('   Example (Mac):     node start-esp32-usb.js /dev/cu.usbserial-0001\n');
    process.exit(0);
  }

  console.log('⚙️  Configuration:');
  console.log(`   Port: ${portPath}`);
  console.log(`   Baud Rate: ${baudRate}`);
  console.log(`   Default Fare: ${process.env.DEFAULT_FARE || 50} T-Pay`);
  console.log(`   Payment Cooldown: ${process.env.PAYMENT_COOLDOWN || 60} seconds\n`);

  // Connect to ESP32
  const connected = await esp32Service.connect(portPath, baudRate);

  if (!connected) {
    console.error('\n❌ Failed to connect to ESP32');
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if ESP32 is connected via USB');
    console.log('   2. Verify the correct port (use device manager on Windows)');
    console.log('   3. Make sure no other program is using the port');
    console.log('   4. Try unplugging and replugging the ESP32\n');
    process.exit(1);
  }

  console.log('\n✅ ESP32 connected successfully!');
  console.log('🔄 Waiting for card scans...\n');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    esp32Service.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Shutting down...');
    esp32Service.disconnect();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
