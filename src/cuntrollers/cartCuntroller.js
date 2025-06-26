const db = require('../config/database').db;

const getCart = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      cart.id AS cart_item_id,
      products.id AS product_id,
      products.name,
      products.brand,
      products.price,
      products.discount,
      cart.quantity,
      (products.price * cart.quantity) AS total_price
    FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching cart:', err.message);
      return res.status(500).json({ message: 'Failed to fetch cart' });
    }

    res.status(200).json({
      message: 'Cart fetched successfully',
      cart: rows,
    });
  });
};
const addToCart = (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Product ID and valid quantity are required' });
  }

  // Check if item already exists in cart
  const selectQuery = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';

  db.get(selectQuery, [userId, productId], (err, row) => {
    if (err) {
      console.error('❌ Error checking cart:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (row) {
      // If product already in cart, update quantity
      const newQty = row.quantity + quantity;
      const updateQuery = 'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

      db.run(updateQuery, [newQty, row.id], function (err) {
        if (err) {
          console.error('❌ Error updating cart:', err.message);
          return res.status(500).json({ message: 'Failed to update cart item' });
        }

        return res.status(200).json({ message: 'Cart item quantity updated successfully' });
      });
    } else {
      // If not, insert new cart item
      const insertQuery = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';

      db.run(insertQuery, [userId, productId, quantity], function (err) {
        if (err) {
          console.error('❌ Error adding to cart:', err.message);
          return res.status(500).json({ message: 'Failed to add item to cart' });
        }

        return res.status(201).json({ message: 'Item added to cart successfully' });
      });
    }
  });
};
const updateCartItem = (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.itemId;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be a positive number' });
  }

  // Ensure item belongs to user before updating
  const query = 'SELECT * FROM cart WHERE id = ? AND user_id = ?';
  db.get(query, [itemId, userId], (err, row) => {
    if (err) {
      console.error('❌ Error checking cart item:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const updateQuery = 'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

    db.run(updateQuery, [quantity, itemId], function (err) {
      if (err) {
        console.error('❌ Error updating cart item:', err.message);
        return res.status(500).json({ message: 'Failed to update cart item' });
      }

      res.status(200).json({ message: 'Cart item updated successfully' });
    });
  });
};
const removeCartItem = (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.itemId;

  // Check if item exists and belongs to the user
  const query = 'SELECT * FROM cart WHERE id = ? AND user_id = ?';
  db.get(query, [itemId, userId], (err, row) => {
    if (err) {
      console.error('❌ Error checking cart item:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Delete item from cart
    const deleteQuery = 'DELETE FROM cart WHERE id = ?';
    db.run(deleteQuery, [itemId], function (err) {
      if (err) {
        console.error('❌ Error deleting cart item:', err.message);
        return res.status(500).json({ message: 'Failed to delete cart item' });
      }

      res.status(200).json({ message: 'Cart item removed successfully' });
    });
  });
};
module.exports = { getCart,addToCart,updateCartItem,removeCartItem};
