// Cart Routes
const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getConflicts,
  applyCoupon,
} = require('../controllers/cartController');

router.get('/', getCart);
router.get('/conflicts', getConflicts);
router.post('/', addToCart);
router.post('/apply-coupon', applyCoupon);
router.put('/:itemId', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:itemId', removeFromCart);

module.exports = router;
