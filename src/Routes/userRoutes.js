const express = require('express');
const { getProfile,updateProfile,getAddresses,addOrUpdateAddress} = require('../cuntrollers/userCuntroller');
const authenticateToken = require('../middlware/authmiddlware');

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile',authenticateToken,updateProfile);
router.get('/address',authenticateToken,getAddresses);
router.put('/address',authenticateToken,addOrUpdateAddress);
module.exports = router;
