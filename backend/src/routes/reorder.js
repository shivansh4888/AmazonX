const express = require('express');
const { getSuggestions } = require('../controllers/reorderController');

const router = express.Router();

router.get('/suggestions', getSuggestions);

module.exports = router;
