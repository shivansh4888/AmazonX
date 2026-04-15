// Order Routes
const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getOrdersByEmail } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getOrdersByEmail);
router.get('/:id', getOrderById);

module.exports = router;
