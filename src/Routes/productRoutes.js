const express = require('express');
const { getProducts,getProductById,getAllCategories} = require('../cuntrollers/productCuntroller');

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/:id',getProductById);
router.get('/catogiries',getAllCategories)
module.exports = router;
