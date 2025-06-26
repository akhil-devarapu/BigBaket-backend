const db = require('../config/database').db;
const initiatePayment = (req, res) => {
  const { amount, paymentMethod } = req.body;

  if (!amount || !paymentMethod) {
    return res.status(400).json({ message: 'Amount and payment method are required' });
  }

  // Mock payment ID generation
  const paymentId = 'pay_' + Math.random().toString(36).substring(2, 12);

  // Mock token/URL for redirection (in real app: redirect to Razorpay or Stripe)
  const paymentToken = 'mock_token_' + Math.random().toString(36).substring(2, 12);

  res.status(200).json({
    message: 'Payment initiated successfully',
    payment: {
      id: paymentId,
      amount,
      method: paymentMethod,
      status: 'pending',
      redirectUrl: `https://mockpayment.gateway/pay/${paymentToken}`
    }
  });
};

const confirmPayment = (req, res) => {
  const userId = req.user.id;
  const { orderId, transactionId, status } = req.body;

  if (!orderId || !transactionId || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Check if the order belongs to the user
  const orderQuery = `SELECT * FROM orders WHERE id = ? AND user_id = ?`;

  db.get(orderQuery, [orderId, userId], (err, order) => {
    if (err) {
      console.error('❌ Error fetching order:', err.message);
      return res.status(500).json({ message: 'Failed to verify order' });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }

    // Insert or update payment
    const insertPayment = `
      INSERT INTO payments (order_id, user_id, amount, method, status, transaction_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
      insertPayment,
      [orderId, userId, order.total_amount, order.payment_method, status, transactionId],
      function (err) {
        if (err) {
          console.error('❌ Failed to confirm payment:', err.message);
          return res.status(500).json({ message: 'Payment confirmation failed' });
        }

        // Update order status if payment successful
        if (status === 'success') {
          const updateOrder = `UPDATE orders SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
          db.run(updateOrder, [orderId]);
        }

        res.status(200).json({ message: `Payment ${status} for order ${orderId}` });
      }
    );
  });
};
const getPaymentStatus = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;

  // Verify if the order belongs to the user
  const verifyOrderQuery = `SELECT * FROM orders WHERE id = ? AND user_id = ?`;

  db.get(verifyOrderQuery, [orderId, userId], (err, order) => {
    if (err) {
      console.error('❌ Error verifying order:', err.message);
      return res.status(500).json({ message: 'Server error while verifying order' });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }

    // Get payment status from the payments table
    const query = `SELECT status, transaction_id, method, created_at FROM payments WHERE order_id = ?`;

    db.get(query, [orderId], (err, payment) => {
      if (err) {
        console.error('❌ Error fetching payment status:', err.message);
        return res.status(500).json({ message: 'Failed to fetch payment status' });
      }

      if (!payment) {
        return res.status(200).json({ message: 'No payment found', status: 'not initiated' });
      }

      res.status(200).json({
        message: 'Payment status fetched successfully',
        status: payment.status,
        method: payment.method,
        transactionId: payment.transaction_id,
        timestamp: payment.created_at
      });
    });
  });
};

module.exports = {
  initiatePayment,
  confirmPayment,
  getPaymentStatus
};
