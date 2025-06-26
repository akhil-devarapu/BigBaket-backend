const db = require('../config/database').db;

const placeOrder = (req, res) => {
  const userId = req.user.id;
  const { deliveryAddressId, deliverySlot, couponCode, paymentMethod } = req.body;

  if (!deliveryAddressId || !deliverySlot || !paymentMethod) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const getCartQuery = `
    SELECT cart.product_id, cart.quantity, products.price
    FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `;

  db.all(getCartQuery, [userId], (err, cartItems) => {
    if (err) {
      console.error('❌ Error fetching cart:', err.message);
      return res.status(500).json({ message: 'Failed to fetch cart' });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    let totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Apply coupon (optional)
    if (couponCode) {
      const couponQuery = 'SELECT discount_percent FROM coupons WHERE code = ?';
      db.get(couponQuery, [couponCode], (err, coupon) => {
        if (err || !coupon) {
          return res.status(400).json({ message: 'Invalid coupon code' });
        }
        totalAmount = totalAmount * (1 - coupon.discount_percent / 100);
        proceedWithOrder(totalAmount);
      });
    } else {
      proceedWithOrder(totalAmount);
    }

    function proceedWithOrder(finalAmount) {
      const orderQuery = `
        INSERT INTO orders (user_id, address_id, delivery_slot, payment_method, total_amount, status)
        VALUES (?, ?, ?, ?, ?, 'placed')
      `;

      db.run(orderQuery, [userId, deliveryAddressId, deliverySlot, paymentMethod, finalAmount], function (err) {
        if (err) {
          console.error('❌ Error placing order:', err.message);
          return res.status(500).json({ message: 'Failed to place order' });
        }

        const orderId = this.lastID;

        // Insert order items
        const insertItems = cartItems.map(item => {
          return new Promise((resolve, reject) => {
            const itemQuery = `
              INSERT INTO order_items (order_id, product_id, quantity, price)
              VALUES (?, ?, ?, ?)
            `;
            db.run(itemQuery, [orderId, item.product_id, item.quantity, item.price], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        });

        // After inserting all items
        Promise.all(insertItems)
          .then(() => {
            // Clear cart
            db.run('DELETE FROM cart WHERE user_id = ?', [userId], (err) => {
              if (err) {
                console.warn('⚠️ Order placed but failed to clear cart');
              }

              return res.status(201).json({
                message: 'Order placed successfully',
                orderId,
                total: finalAmount
              });
            });
          })
          .catch(err => {
            console.error('❌ Failed to insert order items:', err.message);
            res.status(500).json({ message: 'Failed to process order items' });
          });
      });
    }
  });
};
const getUserOrders = (req, res) => {
  const userId = req.user.id;

  // Get user's orders
  const ordersQuery = `
    SELECT * FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.all(ordersQuery, [userId], (err, orders) => {
    if (err) {
      console.error('❌ Error fetching orders:', err.message);
      return res.status(500).json({ message: 'Failed to fetch orders' });
    }

    if (orders.length === 0) {
      return res.status(200).json({ message: 'No past orders found', orders: [] });
    }

    // For each order, fetch its items
    const fetchItems = orders.map(order => {
      return new Promise((resolve, reject) => {
        const itemsQuery = `
          SELECT oi.product_id, p.name, oi.quantity, oi.price
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `;
        db.all(itemsQuery, [order.id], (err, items) => {
          if (err) reject(err);
          else {
            resolve({
              ...order,
              items
            });
          }
        });
      });
    });

    Promise.all(fetchItems)
      .then(results => {
        res.status(200).json({
          message: 'Orders fetched successfully',
          orders: results
        });
      })
      .catch(err => {
        console.error('❌ Error fetching order items:', err.message);
        res.status(500).json({ message: 'Failed to fetch order items' });
      });
  });
};
const getOrderById = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  // 1. Fetch the order
  const orderQuery = `
    SELECT * FROM orders
    WHERE id = ? AND user_id = ?
  `;

  db.get(orderQuery, [orderId, userId], (err, order) => {
    if (err) {
      console.error('❌ Error fetching order:', err.message);
      return res.status(500).json({ message: 'Failed to fetch order' });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 2. Fetch the delivery address
    const addressQuery = `
      SELECT id, type, city, pincode
      FROM user_addresses
      WHERE id = ?
    `;

    db.get(addressQuery, [order.address_id], (err, address) => {
      if (err) {
        console.error('❌ Error fetching address:', err.message);
        return res.status(500).json({ message: 'Failed to fetch address' });
      }

      // 3. Fetch order items
      const itemsQuery = `
        SELECT oi.product_id, p.name, oi.quantity, oi.price
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;

      db.all(itemsQuery, [orderId], (err, items) => {
        if (err) {
          console.error('❌ Error fetching order items:', err.message);
          return res.status(500).json({ message: 'Failed to fetch order items' });
        }

        res.status(200).json({
          message: 'Order details fetched successfully',
          order: {
            ...order,
            address,
            items
          }
        });
      });
    });
  });
};

const cancelOrder = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  // Check if order exists and belongs to user
  const query = `SELECT * FROM orders WHERE id = ? AND user_id = ?`;

  db.get(query, [orderId, userId], (err, order) => {
    if (err) {
      console.error('❌ Error fetching order:', err.message);
      return res.status(500).json({ message: 'Failed to fetch order' });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'placed') {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    const cancelQuery = `UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(cancelQuery, [orderId], function (err) {
      if (err) {
        console.error('❌ Error cancelling order:', err.message);
        return res.status(500).json({ message: 'Failed to cancel order' });
      }

      return res.status(200).json({ message: 'Order cancelled successfully' });
    });
  });
};
module.exports = { placeOrder,getUserOrders,getOrderById,cancelOrder};
