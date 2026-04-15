const express = require('express');
const { getChallenge, submitAttempt } = require('../controllers/challengeController');

const router = express.Router();

router.get('/:productId', getChallenge);
router.post('/attempt', submitAttempt);

module.exports = router;
