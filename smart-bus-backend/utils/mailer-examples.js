/**
 * Example: How to use SmartBus mailer functions
 * 
 * This file demonstrates how to integrate email notifications
 * into your controllers and services.
 */

import { sendPaymentConfirmation, sendRechargeConfirmation } from './mailer.js';

// ==========================================
// EXAMPLE 1: Send Payment Confirmation
// ==========================================

async function examplePaymentEmail() {
  const paymentData = {
    userEmail: 'user@example.com',
    userName: 'John Doe',
    cardUid: 'CARD-12345',
    amount: 50.00,
    remainingBalance: 100.00,
    timestamp: new Date(),
  };

  const result = await sendPaymentConfirmation(paymentData);
  
  if (result.success) {
    console.log('✅ Payment email sent!', result.messageId);
  } else {
    console.error('❌ Email failed:', result.error);
  }
}

// ==========================================
// EXAMPLE 2: Send Recharge Confirmation
// ==========================================

async function exampleRechargeEmail() {
  const rechargeData = {
    userEmail: 'user@example.com',
    userName: 'Jane Smith',
    cardUid: 'CARD-67890',
    amount: 100.00,
    newBalance: 250.00,
    timestamp: new Date(),
  };

  const result = await sendRechargeConfirmation(rechargeData);
  
  if (result.success) {
    console.log('✅ Recharge email sent!', result.messageId);
  } else {
    console.error('❌ Email failed:', result.error);
  }
}

// ==========================================
// EXAMPLE 3: Use in Controller (Non-blocking)
// ==========================================

async function exampleControllerIntegration(req, res) {
  // 1. Process the payment first
  const payment = await processPayment(req.body);
  
  // 2. Send response immediately (don't wait for email)
  res.json({ success: true, balance: payment.newBalance });
  
  // 3. Send email in background (non-blocking)
  sendPaymentConfirmation({
    userEmail: req.user.email,
    userName: req.user.name,
    cardUid: payment.cardUid,
    amount: payment.amount,
    remainingBalance: payment.newBalance,
    timestamp: new Date(),
  }).catch(err => {
    // Log errors but don't fail the request
    console.error('Email sending failed:', err);
  });
}

// ==========================================
// EXAMPLE 4: Error Handling
// ==========================================

async function exampleWithErrorHandling() {
  try {
    const result = await sendPaymentConfirmation({
      userEmail: 'test@example.com',
      userName: 'Test User',
      cardUid: 'TEST-001',
      amount: 25.50,
      remainingBalance: 74.50,
    });

    if (!result.success) {
      // Handle gracefully - maybe log to a monitoring service
      console.error('Email failed but payment succeeded:', result.error);
      
      // Could add to a retry queue here
      // await emailQueue.add({ type: 'payment', data: ... });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// ==========================================
// EXAMPLE 5: Conditional Email Sending
// ==========================================

async function exampleConditionalEmail(user, payment) {
  // Only send email if user has email and hasn't opted out
  if (user.email && user.emailNotifications !== false) {
    await sendPaymentConfirmation({
      userEmail: user.email,
      userName: user.name,
      cardUid: payment.cardUid,
      amount: payment.amount,
      remainingBalance: payment.balance,
    });
  } else {
    console.log('User has no email or opted out of notifications');
  }
}

// ==========================================
// EXAMPLE 6: Batch Email Sending
// ==========================================

async function exampleBatchEmails(payments) {
  const emailPromises = payments.map(payment => 
    sendPaymentConfirmation({
      userEmail: payment.user.email,
      userName: payment.user.name,
      cardUid: payment.cardUid,
      amount: payment.amount,
      remainingBalance: payment.balance,
    })
  );

  // Send all emails in parallel
  const results = await Promise.allSettled(emailPromises);
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`✅ Sent ${successful} emails, ❌ Failed ${failed} emails`);
}

// ==========================================
// HELPER: Mock payment processing
// ==========================================

async function processPayment(data) {
  // Simulated payment processing
  return {
    cardUid: 'CARD-123',
    amount: parseFloat(data.amount),
    newBalance: 100.00,
  };
}

// ==========================================
// Export examples (optional)
// ==========================================

export {
  examplePaymentEmail,
  exampleRechargeEmail,
  exampleControllerIntegration,
  exampleWithErrorHandling,
  exampleConditionalEmail,
  exampleBatchEmails,
};
