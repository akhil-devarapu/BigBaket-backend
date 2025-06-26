const db = require('../config/database').db;

const isAdmin = (req, res, next) => {
  const userId = req.user.id;

  const query = `SELECT role FROM users WHERE id = ?`;

  db.get(query, [userId], (err, user) => {
    if (err) {
      console.error('❌ Error checking admin status:', err.message);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    next();
  });
};

module.exports = isAdmin;
