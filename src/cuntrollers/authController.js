const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database').db || require('../config/database'); // in case you export multiple

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('❌ DB error while checking user:', err.message);
        return res.status(500).json({ message: 'Database error' });
      }

      if (user) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const insertQuery = `INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)`;
      db.run(insertQuery, [name, email, hashedPassword, phone], function (err) {
        if (err) {
          console.error('❌ Error inserting user:', err.message);
          return res.status(500).json({ message: 'Error creating user' });
        }

        // Generate JWT
        const userId = this.lastID;
        const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        });

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: userId,
            name,
            email,
            phone,
          },
        });
      });
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('❌ DB error during login:', err.message);
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
    db.run(
        'INSERT INTO user_tokens (user_id, token) VALUES (?, ?)',
        [user.id, token],
        (err) => {
            if (err) console.error('❌ Failed to save token:', err.message);
        }
        );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};
const logoutAll = (req, res) => {
  const userId = req.user.id;

  db.run('DELETE FROM user_tokens WHERE user_id = ?', [userId], function (err) {
    if (err) {
      console.error('❌ Error during logout all:', err.message);
      return res.status(500).json({ message: 'Server error during logout' });
    }

    res.status(200).json({ message: 'Logged out from all devices successfully' });
  });
};


module.exports = {
  register,
  login,logoutAll // include login here
};

