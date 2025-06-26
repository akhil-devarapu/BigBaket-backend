const express = require('express');
const router = express.Router();
const { deliveryLogin ,registerDeliveryStaff,getAssignedOrders,updateDeliveryStatus} = require('../cuntrollers/deliveryCuntroller');
const authenticateToken=require('../middlware/deliveryMiddleware');
// POST /api/delivery/login
router.post('/delivery/login', deliveryLogin);
router.post('/delivery/register',registerDeliveryStaff);
router.get('/delivery/orders', authenticateToken, getAssignedOrders);
router.put('/delivery/orders/:id/status', authenticateToken, updateDeliveryStatus);
module.exports = router;
