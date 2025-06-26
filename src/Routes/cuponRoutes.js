const express = require('express');
const router = express.Router();
const { getActiveCoupons,validateCoupon } = require('../cuntrollers/cuponCuntroller');

router.get('/coupons', getActiveCoupons);
router.post('/coupons/validate', validateCoupon);
module.exports = router;

