// Product Routes
const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getProductPriceInsight } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id/price-insight', getProductPriceInsight);
router.get('/:id', getProductById);

module.exports = router;
