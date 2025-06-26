const express = require('express');
const { placeOrder,getUserOrders,getOrderById,cancelOrder } = require('../cuntrollers/orderscuntroller');
const authenticateToken = require('../middlware/authmiddlware');

const router = express.Router();

router.post('/orders', authenticateToken, placeOrder);
router.get('/orders',authenticateToken,getUserOrders);
router.get('/orders/:id', authenticateToken, getOrderById);
router.put('/orders/:id',authenticateToken,cancelOrder);
module.exports = router;
