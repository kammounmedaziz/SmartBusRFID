import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates and configures the email transporter using environment variables
 * @returns {nodemailer.Transporter} Configured nodemailer transporter
 */
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Sends a payment confirmation email to the user
 * @param {Object} paymentData - The payment transaction data
 * @param {string} paymentData.userEmail - Recipient email address
 * @param {string} paymentData.userName - Recipient name
 * @param {string} paymentData.cardUid - Card UID used for payment
 * @param {number} paymentData.amount - Amount paid
 * @param {number} paymentData.remainingBalance - Balance after payment
 * @param {Date} paymentData.timestamp - Transaction timestamp
 * @returns {Promise<Object>} Email send result
 */
export const sendPaymentConfirmation = async (paymentData) => {
  try {
    const {
      userEmail,
      userName,
      cardUid,
      amount,
      remainingBalance,
      timestamp = new Date(),
    } = paymentData;

    // Validate required fields
    if (!userEmail || !cardUid || amount == null || remainingBalance == null) {
      throw new Error('Missing required payment data fields');
    }

    const transporter = createTransporter();

    // Format the date and time
    const formattedDate = new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Create email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f7fa;
              margin: 0;
              padding: 20px;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 16px;
              opacity: 0.95;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .transaction-box {
              background: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .transaction-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e1e8ed;
            }
            .transaction-row:last-child {
              border-bottom: none;
            }
            .label {
              color: #657786;
              font-weight: 500;
            }
            .value {
              color: #14171a;
              font-weight: 600;
            }
            .amount {
              color: #e74c3c;
              font-size: 24px;
              font-weight: 700;
            }
            .balance {
              color: #27ae60;
              font-size: 20px;
              font-weight: 700;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              color: #657786;
              font-size: 14px;
            }
            .footer a {
              color: #667eea;
              text-decoration: none;
            }
            .success-icon {
              width: 60px;
              height: 60px;
              background: #27ae60;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 32px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🚌 SmartBus</h1>
              <p>Payment Confirmation</p>
            </div>
            <div class="content">
              <div class="success-icon">✓</div>
              <div class="greeting">
                Hello ${userName || 'Valued Customer'},
              </div>
              <p style="color: #657786; line-height: 1.6;">
                Your payment has been successfully processed. Here are the details of your transaction:
              </p>
              
              <div class="transaction-box">
                <div class="transaction-row">
                  <span class="label">Card UID:</span>
                  <span class="value">${cardUid}</span>
                </div>
                <div class="transaction-row">
                  <span class="label">Amount Paid:</span>
                  <span class="amount">${amount.toFixed(2)} T-Pay</span>
                </div>
                <div class="transaction-row">
                  <span class="label">Remaining Balance:</span>
                  <span class="balance">${remainingBalance.toFixed(2)} T-Pay</span>
                </div>
                <div class="transaction-row">
                  <span class="label">Date:</span>
                  <span class="value">${formattedDate}</span>
                </div>
                <div class="transaction-row">
                  <span class="label">Time:</span>
                  <span class="value">${formattedTime}</span>
                </div>
              </div>

              <p style="color: #657786; line-height: 1.6; margin-top: 20px;">
                Thank you for using SmartBus! If you have any questions about this transaction, 
                please don't hesitate to contact our support team.
              </p>
            </div>
            <div class="footer">
              <p>
                This is an automated message from SmartBus.<br>
                Please do not reply to this email.
              </p>
              <p style="margin-top: 10px;">
                <a href="#">Visit Dashboard</a> | <a href="#">Contact Support</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version for email clients that don't support HTML
    const textContent = `
SmartBus - Payment Confirmation

Hello ${userName || 'Valued Customer'},

Your payment has been successfully processed.

Transaction Details:
-------------------
Card UID: ${cardUid}
Amount Paid: ${amount.toFixed(2)} T-Pay
Remaining Balance: ${remainingBalance.toFixed(2)} T-Pay
Date: ${formattedDate}
Time: ${formattedTime}

Thank you for using SmartBus!

---
This is an automated message. Please do not reply to this email.
    `.trim();

    // Email options
    const mailOptions = {
      from: `"SmartBus" <${process.env.SMTP_FROM || 'no-reply@smartbus.com'}>`,
      to: userEmail,
      subject: '✅ Payment Confirmation - SmartBus',
      text: textContent,
      html: htmlContent,
    };

    // Send email
    console.log(`📧 Sending payment confirmation email to: ${userEmail}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: userEmail,
    };
  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
    
    // Don't throw the error - we don't want email failures to break the payment flow
    // Just log it and return failure status
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Sends a recharge confirmation email to the user
 * @param {Object} rechargeData - The recharge transaction data
 * @param {string} rechargeData.userEmail - Recipient email address
 * @param {string} rechargeData.userName - Recipient name
 * @param {string} rechargeData.cardUid - Card UID that was recharged
 * @param {number} rechargeData.amount - Amount recharged
 * @param {number} rechargeData.newBalance - Balance after recharge
 * @param {Date} rechargeData.timestamp - Transaction timestamp
 * @returns {Promise<Object>} Email send result
 */
export const sendRechargeConfirmation = async (rechargeData) => {
  try {
    const {
      userEmail,
      userName,
      cardUid,
      amount,
      newBalance,
      timestamp = new Date(),
    } = rechargeData;

    if (!userEmail || !cardUid || amount == null || newBalance == null) {
      throw new Error('Missing required recharge data fields');
    }

    const transporter = createTransporter();

    const formattedDate = new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f7fa;
              margin: 0;
              padding: 20px;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 16px;
              opacity: 0.95;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .transaction-box {
              background: #f8f9fa;
              border-left: 4px solid #27ae60;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .transaction-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e1e8ed;
            }
            .transaction-row:last-child {
              border-bottom: none;
            }
            .label {
              color: #657786;
              font-weight: 500;
            }
            .value {
              color: #14171a;
              font-weight: 600;
            }
            .amount {
              color: #27ae60;
              font-size: 24px;
              font-weight: 700;
            }
            .balance {
              color: #27ae60;
              font-size: 20px;
              font-weight: 700;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              color: #657786;
              font-size: 14px;
            }
            .success-icon {
              width: 60px;
              height: 60px;
              background: #27ae60;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 32px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🚌 SmartBus</h1>
              <p>Recharge Confirmation</p>
            </div>
            <div class="content">
              <div class="success-icon">✓</div>
              <div class="greeting">
                Hello ${userName || 'Valued Customer'},
              </div>
              <p style="color: #657786; line-height: 1.6;">
                Your card has been successfully recharged! Here are the details:
              </p>
              
              <div class="transaction-box">
                <div class="transaction-row">
                  <span class="label">Card UID:</span>
                  <span class="value">${cardUid}</span>
                </div>
                <div class="transaction-row">
                  <span class="label">Amount Recharged:</span>
                  <span class="amount">+${amount.toFixed(2)} T-Pay</span>
                </div>
                <div class="transaction-row">
                  <span class="label">New Balance:</span>
                  <span class="balance">${newBalance.toFixed(2)} T-Pay</span>
                </div>
                <div class="transaction-row">
                  <span class="label">Date:</span>
                  <span class="value">${formattedDate}</span>
                </div>
                <div class="transaction-row">
                  <span class="label">Time:</span>
                  <span class="value">${formattedTime}</span>
                </div>
              </div>

              <p style="color: #657786; line-height: 1.6; margin-top: 20px;">
                Thank you for topping up your SmartBus card!
              </p>
            </div>
            <div class="footer">
              <p>
                This is an automated message from SmartBus.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
SmartBus - Recharge Confirmation

Hello ${userName || 'Valued Customer'},

Your card has been successfully recharged!

Transaction Details:
-------------------
Card UID: ${cardUid}
Amount Recharged: +${amount.toFixed(2)} T-Pay
New Balance: ${newBalance.toFixed(2)} T-Pay
Date: ${formattedDate}
Time: ${formattedTime}

Thank you for using SmartBus!
    `.trim();

    const mailOptions = {
      from: `"SmartBus" <${process.env.SMTP_FROM || 'no-reply@smartbus.com'}>`,
      to: userEmail,
      subject: '💰 Recharge Confirmation - SmartBus',
      text: textContent,
      html: htmlContent,
    };

    console.log(`📧 Sending recharge confirmation email to: ${userEmail}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: userEmail,
    };
  } catch (error) {
    console.error('❌ Error sending recharge confirmation email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  sendPaymentConfirmation,
  sendRechargeConfirmation,
};
