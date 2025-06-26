const express = require('express');
const { getCart,addToCart,updateCartItem,removeCartItem} = require('../cuntrollers/cartCuntroller');
const authenticateToken = require('../middlware/authmiddlware');

const router = express.Router();
router.get('/cart', authenticateToken, getCart);
router.post('/cart',authenticateToken,addToCart);
router.put('/cart/:itemId', authenticateToken, updateCartItem);
router.delete('/cart/:itemId', authenticateToken, removeCartItem);
module.exports = router;
