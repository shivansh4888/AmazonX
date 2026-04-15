const express = require('express');
const router = express.Router();
const { canReview, getReviews, createReview } = require('../controllers/reviewController');

router.get('/can-review', canReview);
router.get('/:productId', getReviews);
router.post('/', createReview);

module.exports = router;