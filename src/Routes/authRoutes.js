const express = require('express');
const { register,login,logoutAll } = require('../cuntrollers/authController');
const authenticateToken = require('../middlware/authmiddlware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logoutAll);
module.exports = router;
