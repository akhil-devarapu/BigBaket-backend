const db = require('../config/database').db;

const getActiveCoupons = (req, res) => {
  const now = new Date().toISOString();

  const query = `
    SELECT  code, discount_percent, expiry
    FROM coupons
    WHERE status = 'active' AND (expiry IS NULL OR expiry > ?)
  `;

  db.all(query, [now], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching coupons:', err.message);
      return res.status(500).json({ message: 'Failed to fetch coupons' });
    }

    res.status(200).json({
      message: 'Coupons fetched successfully',
      coupons: rows
    });
  });
};
const validateCoupon = (req, res) => {
  const { code, orderTotal } = req.body;

  if (!code || !orderTotal) {
    return res.status(400).json({ message: 'Coupon code and order total are required' });
  }

  const query = `SELECT * FROM coupons WHERE code = ?`;

  db.get(query, [code], (err, coupon) => {
    if (err) {
      console.error('❌ Error fetching coupon:', err.message);
      return res.status(500).json({ message: 'Server error while validating coupon' });
    }

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    const discount = Math.round((coupon.discount_percent / 100) * orderTotal);

    res.status(200).json({
      message: 'Coupon is valid',
      code: coupon.code,
      discountPercent: coupon.discount_percent,
      discountAmount: discount,
      finalAmount: orderTotal - discount
    });
  });
};
module.exports = {
  getActiveCoupons,validateCoupon
};
