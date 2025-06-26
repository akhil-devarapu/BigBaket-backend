const db = require('../config/database').db;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerDeliveryStaff = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if staff already exists
    const checkQuery = `SELECT * FROM delivery_staff WHERE email = ?`;
    db.get(checkQuery, [email], async (err, existing) => {
      if (err) {
        console.error('❌ Error checking delivery staff:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      if (existing) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO delivery_staff (name, email, password, phone)
        VALUES (?, ?, ?, ?)
      `;

      db.run(insertQuery, [name, email, hashedPassword, phone], function (err) {
        if (err) {
          console.error('❌ Error inserting delivery staff:', err.message);
          return res.status(500).json({ message: 'Failed to register delivery staff' });
        }

        res.status(201).json({
          message: 'Delivery staff registered successfully',
          staff: {
            id: this.lastID,
            name,
            email,
            phone
          }
        });
      });
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const deliveryLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const sql = `SELECT * FROM delivery_staff WHERE email = ?`;

  db.get(sql, [email], async (err, staff) => {
    if (err) {
      console.error('❌ DB error during login:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!staff) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: staff.id, role: 'delivery' }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone
      }
    });
  });
};

const getAssignedOrders = (req, res) => {
  const deliveryStaffId = req.user.id; // comes from decoded token

  const sql = `
    SELECT o.id AS order_id, u.name AS customer_name, o.total_amount, o.status,
           o.delivery_slot, o.created_at, o.address_id
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.delivery_staff_id = ?
    ORDER BY o.created_at DESC
  `;

  db.all(sql, [deliveryStaffId], (err, rows) => {
    if (err) {
      console.error('❌ Failed to fetch assigned orders:', err.message);
      return res.status(500).json({ message: 'Server error fetching orders' });
    }

    res.status(200).json({
      message: 'Assigned orders fetched successfully',
      orders: rows
    });
  });
};

const updateDeliveryStatus = (req, res) => {
  const deliveryStaffId = req.user.id;
  const { id } = req.params; // order ID
  const { status } = req.body;

  const validStatuses = ['picked_up', 'on_the_way', 'delivered'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing delivery status' });
  }

  // Check if the order is assigned to the current delivery staff
  const checkQuery = `SELECT * FROM orders WHERE id = ? AND delivery_staff_id = ?`;
  db.get(checkQuery, [id, deliveryStaffId], (err, order) => {
    if (err) {
      console.error('❌ Error checking order:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!order) {
      return res.status(403).json({ message: 'Order not assigned to you or not found' });
    }

    const updateQuery = `UPDATE orders SET status = ? WHERE id = ?`;
    db.run(updateQuery, [status, id], function (err) {
      if (err) {
        console.error('❌ Error updating order status:', err.message);
        return res.status(500).json({ message: 'Failed to update delivery status' });
      }

      res.status(200).json({ message: 'Delivery status updated successfully' });
    });
  });
};


module.exports = {
  registerDeliveryStaff,deliveryLogin,getAssignedOrders,updateDeliveryStatus
};
