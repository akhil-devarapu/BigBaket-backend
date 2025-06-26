const db = require('../config/database').db;

const getProducts = (req, res) => {
  const { search, category, brand, minPrice, maxPrice } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (brand) {
    query += ' AND brand = ?';
    params.push(brand);
  }

  if (minPrice) {
    query += ' AND price >= ?';
    params.push(minPrice);
  }

  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(maxPrice);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('❌ Error fetching products:', err.message);
      return res.status(500).json({ message: 'Failed to fetch products' });
    }

    res.status(200).json({
      message: 'Products fetched successfully',
      products: rows,
    });
  });
};
const getProductById = (req, res) => {
  const productId = req.params.id;

  const query = 'SELECT * FROM products WHERE id = ?';
  db.get(query, [productId], (err, row) => {
    if (err) {
      console.error('❌ Error fetching product by ID:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product details fetched successfully',
      product: row,
    });
  });
};
const getAllCategories = (req, res) => {
  const query = 'SELECT DISTINCT category FROM products WHERE category IS NOT NULL';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching categories:', err.message);
      return res.status(500).json({ message: 'Server error while fetching categories' });
    }

    const categories = rows.map(row => row.category);
    res.status(200).json({
      message: 'Categories fetched successfully',
      categories,
    });
  });
};
module.exports = { getProducts,getProductById,getAllCategories};
