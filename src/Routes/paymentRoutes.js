const express = require('express');
const router = express.Router();
const { initiatePayment,confirmPayment,getPaymentStatus } = require('../cuntrollers/paymentController');
const authenticateToken = require('../middlware/authmiddlware');

router.post('/payments/initiate',authenticateToken,initiatePayment);
router.post('/payments/confirm', authenticateToken, confirmPayment);
router.get('/payments/status/:orderId', authenticateToken, getPaymentStatus);

module.exports = router;
