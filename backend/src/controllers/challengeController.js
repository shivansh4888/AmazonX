const { attemptChallenge, getChallengeByProductId } = require('../services/challengeService');
const { getUserId } = require('../utils/requestContext');

const getChallenge = async (req, res) => {
  try {
    const challenge = await getChallengeByProductId(req.params.productId);

    if (!challenge) {
      return res.status(404).json({ error: 'No challenge available for this product' });
    }

    res.json(challenge);
  } catch (error) {
    console.error('getChallenge error:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const { challengeId, answer } = req.body;

    if (!challengeId || !String(answer || '').trim()) {
      return res.status(400).json({ error: 'challengeId and answer are required' });
    }

    const result = await attemptChallenge({
      userId: getUserId(req),
      challengeId,
      answer,
    });

    res.json({
      success: result.success,
      message: result.message,
      coupon: result.coupon
        ? {
            code: result.coupon.code,
            discountPercent: result.coupon.discountPercent,
            productId: result.coupon.productId,
            expiresAt: result.coupon.expiresAt,
          }
        : null,
    });
  } catch (error) {
    console.error('submitAttempt error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to validate challenge' });
  }
};

module.exports = {
  getChallenge,
  submitAttempt,
};
