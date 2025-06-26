const db = require('../config/database').db;

const addProduct = (req, res) => {
  const { name, description, price, category, imageUrl, stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Product name and price are required' });
  }

  const query = `
    INSERT INTO products (name, description, price, category, image_url, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [name, description, price, category, imageUrl, stock || 0], function (err) {
    if (err) {
      console.error('❌ Error adding product:', err.message);
      return res.status(500).json({ message: 'Failed to add product' });
    }

    res.status(201).json({
      message: 'Product added successfully',
      productId: this.lastID
    });
  });
};
const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, imageUrl, stock } = req.body;

  const fields = [];
  const values = [];

  if (name) {
    fields.push('name = ?');
    values.push(name);
  }
  if (description) {
    fields.push('description = ?');
    values.push(description);
  }
  if (price !== undefined) {
    fields.push('price = ?');
    values.push(price);
  }
  if (category) {
    fields.push('category = ?');
    values.push(category);
  }
  if (imageUrl) {
    fields.push('image_url = ?');
    values.push(imageUrl);
  }
  if (stock !== undefined) {
    fields.push('stock = ?');
    values.push(stock);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields provided to update' });
  }

  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  db.run(sql, values, function (err) {
    if (err) {
      console.error('❌ Failed to update product:', err.message);
      return res.status(500).json({ message: 'Failed to update product' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully' });
  });
};

const deleteProduct = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM products WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      console.error('❌ Error deleting product:', err.message);
      return res.status(500).json({ message: 'Server error while deleting product' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  });
};

const getAllOrders = (req, res) => {
  const query = `
    SELECT o.id AS order_id, o.user_id, u.name AS user_name, o.total_amount, 
           o.status,  o.created_at, o.address_id, 
           o.delivery_slot, o.payment_method
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Failed to fetch orders:', err.message);
      return res.status(500).json({ message: 'Server error while fetching orders' });
    }

    res.status(200).json({
      message: 'Orders fetched successfully',
      orders: rows
    });
  });
};
const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing status value' });
  }

  const sql = `UPDATE orders SET status = ? WHERE id = ?`;

  db.run(sql, [status, id], function (err) {
    if (err) {
      console.error('❌ Error updating order status:', err.message);
      return res.status(500).json({ message: 'Failed to update order status' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully' });
  });
};
module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus
};
