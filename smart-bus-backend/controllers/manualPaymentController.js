import ManualPayment from "../models/manualPaymentModel.js";

// Create manual payment request
export const createManualPayment = async (req, res) => {
  try {
    const { amount, payment_method, notes } = req.body;
    const user_id = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const id = await ManualPayment.create({
      user_id,
      amount,
      payment_method: payment_method || 'cash',
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Payment request submitted',
      id
    });
  } catch (err) {
    console.error('createManualPayment error:', err);
    res.status(500).json({ error: err.message || 'Failed to create payment request' });
  }
};

// Get user's manual payment history
export const getMyPayments = async (req, res) => {
  try {
    const payments = await ManualPayment.getByUserId(req.user.id);
    res.json({ data: payments });
  } catch (err) {
    console.error('getMyPayments error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch payments' });
  }
};

// Admin: Get all manual payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await ManualPayment.getAll();
    res.json({ data: payments });
  } catch (err) {
    console.error('getAllPayments error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch payments' });
  }
};

// Admin: Get pending payments
export const getPendingPayments = async (req, res) => {
  try {
    const payments = await ManualPayment.getPending();
    res.json({ data: payments });
  } catch (err) {
    console.error('getPendingPayments error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch pending payments' });
  }
};

// Admin: Verify/reject payment
export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be verified or rejected' });
    }

    await ManualPayment.updateStatus(id, status, req.user.id);

    res.json({
      success: true,
      message: `Payment ${status} successfully`
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ error: err.message || 'Failed to verify payment' });
  }
};
