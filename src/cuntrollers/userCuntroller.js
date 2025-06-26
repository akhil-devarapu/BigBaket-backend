const db = require('../config/database').db;

const getProfile = (req, res) => {
  const userId = req.user.id;

  db.get('SELECT id, name, email, phone FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('❌ Error fetching profile:', err.message);
      return res.status(500).json({ message: 'Error fetching profile' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile fetched successfully',
      user,
    });
  });
};
const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Name, email, and phone are required' });
  }

  const updateQuery = `
    UPDATE users
    SET name = ?, email = ?, phone = ?
    WHERE id = ?
  `;

  db.run(updateQuery, [name, email, phone, userId], function (err) {
    if (err) {
      console.error('❌ Error updating profile:', err.message);
      return res.status(500).json({ message: 'Error updating profile' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name,
        email,
        phone,
      },
    });
  });
};
const getAddresses = (req, res) => {
  const userId = req.user.id;
  console.log('Authenticated User ID:', req.user.id);
  const query = 'SELECT * FROM user_addresses WHERE user_id = ?';
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching addresses:', err.message);
      return res.status(500).json({ message: 'Server error while fetching addresses' });
    }

    res.status(200).json({
      message: 'Addresses fetched successfully',
      addresses: rows,
    });
  });
};
const addOrUpdateAddress = (req, res) => {
  const userId = req.user.id;
  const { type, city, pincode } = req.body;

  if (!type || !city || !pincode) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if address of this type already exists
  const query = `SELECT * FROM user_addresses WHERE user_id = ? AND type = ?`;
  db.get(query, [userId, type], (err, existing) => {
    if (err) {
      console.error('❌ Error checking address:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }

    if (existing) {
      // Update existing address
      const updateQuery = `
        UPDATE user_addresses 
        SET  city = ?, pincode = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND type = ?
      `;
      db.run(updateQuery, [ city, pincode, userId, type], function (updateErr) {
        if (updateErr) {
          console.error('❌ Error updating address:', updateErr.message);
          return res.status(500).json({ message: 'Failed to update address' });
        }
        return res.status(200).json({ message: 'Address updated successfully' });
      });
    } else {
      // Insert new address
      const insertQuery = `
        INSERT INTO user_addresses (user_id, type, city, pincode)
        VALUES (?, ?, ?, ?)
      `;
      db.run(insertQuery, [userId, type,  city, pincode], function (insertErr) {
        if (insertErr) {
          console.error('❌ Error inserting address:', insertErr.message);
          return res.status(500).json({ message: 'Failed to add address' });
        }
        return res.status(201).json({ message: 'Address added successfully' });
      });
    }
  });
};

module.exports = {
  getProfile,updateProfile,getAddresses,addOrUpdateAddress
};
