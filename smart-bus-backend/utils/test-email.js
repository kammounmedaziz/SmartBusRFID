import { sendPaymentConfirmation, sendRechargeConfirmation } from './mailer.js';

/**
 * Test script for email functionality
 * Run with: node utils/test-email.js
 */

console.log('🧪 SmartBus Email Test Script\n');
console.log('='.repeat(50));

// Test data for payment confirmation
const testPaymentData = {
  userEmail: 'kammounaziz12@gmail.com', // Replace with your actual email
  userName: 'John Doe',
  cardUid: 'ABC123XYZ789',
  amount: 50.00,
  remainingBalance: 150.00,
  timestamp: new Date(),
};

// Test data for recharge confirmation
const testRechargeData = {
  userEmail: 'kammounaziz12@gmail.com', // Replace with your actual email
  userName: 'John Doe',
  cardUid: 'ABC123XYZ789',
  amount: 100.00,
  newBalance: 250.00,
  timestamp: new Date(),
};

async function runTests() {
  console.log('\n📧 Test 1: Payment Confirmation Email');
  console.log('-'.repeat(50));
  console.log('Sending payment confirmation to:', testPaymentData.userEmail);
  
  try {
    const paymentResult = await sendPaymentConfirmation(testPaymentData);
    
    if (paymentResult.success) {
      console.log('✅ Payment email sent successfully!');
      console.log('   Message ID:', paymentResult.messageId);
      console.log('   Recipient:', paymentResult.recipient);
    } else {
      console.log('❌ Payment email failed:');
      console.log('   Error:', paymentResult.error);
    }
  } catch (error) {
    console.log('❌ Unexpected error during payment email test:');
    console.log('   ', error.message);
  }

  console.log('\n📧 Test 2: Recharge Confirmation Email');
  console.log('-'.repeat(50));
  console.log('Sending recharge confirmation to:', testRechargeData.userEmail);
  
  try {
    const rechargeResult = await sendRechargeConfirmation(testRechargeData);
    
    if (rechargeResult.success) {
      console.log('✅ Recharge email sent successfully!');
      console.log('   Message ID:', rechargeResult.messageId);
      console.log('   Recipient:', rechargeResult.recipient);
    } else {
      console.log('❌ Recharge email failed:');
      console.log('   Error:', rechargeResult.error);
    }
  } catch (error) {
    console.log('❌ Unexpected error during recharge email test:');
    console.log('   ', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Test completed!\n');
  
  console.log('💡 Tips:');
  console.log('   - Check your spam folder if you don\'t see the emails');
  console.log('   - Make sure your SMTP credentials in .env are correct');
  console.log('   - For Gmail, use an App Password (not your regular password)');
  console.log('   - Update userEmail in this script to your actual email address\n');
}

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
