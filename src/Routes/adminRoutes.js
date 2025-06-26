const express = require('express');
const router = express.Router();
const { addProduct,updateProduct,deleteProduct,getAllOrders,updateOrderStatus} = require('../cuntrollers/adminCuntroller');
const  authenticateToken = require('../middlware/authmiddlware');
const isAdmin=require('../middlware/isadminMiddleware')
router.post('/admin/products', authenticateToken,isAdmin, addProduct);
router.put('/admin/products/:id', authenticateToken, isAdmin, updateProduct);
router.delete('/admin/products/:id', authenticateToken, isAdmin, deleteProduct);
router.get('/admin/orders', authenticateToken, isAdmin, getAllOrders);
router.put('/admin/orders/:id/status', authenticateToken, isAdmin, updateOrderStatus);
module.exports = router;
