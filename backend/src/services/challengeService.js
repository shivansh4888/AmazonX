const prisma = require('../lib/prisma');

const normalize = (value) => String(value || '').trim().toLowerCase();

const generateCouponCode = () => {
  return `SKILL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

const getChallengeByProductId = async (productId) => {
  const challenge = await prisma.challenge.findFirst({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  });

  if (!challenge) return null;

  return {
    id: challenge.id,
    productId: challenge.productId,
    type: challenge.type.toLowerCase(),
    prompt: challenge.prompt,
    discountPercent: challenge.discountPercent,
  };
};

const attemptChallenge = async ({ userId, challengeId, answer }) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) {
    const error = new Error('Challenge not found');
    error.status = 404;
    throw error;
  }

  const isCorrect = normalize(challenge.answer) === normalize(answer);
  let coupon = null;

  if (isCorrect) {
    coupon = await prisma.coupon.create({
      data: {
        code: generateCouponCode(),
        userId,
        productId: challenge.productId,
        discountPercent: challenge.discountPercent,
        expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
      },
    });
  }

  await prisma.challengeAttempt.create({
    data: {
      challengeId,
      userId,
      answer: String(answer || ''),
      isCorrect,
      couponCode: coupon?.code,
    },
  });

  return {
    success: isCorrect,
    message: isCorrect ? 'Challenge solved. Discount unlocked.' : 'That answer is not correct yet.',
    coupon,
  };
};

module.exports = {
  getChallengeByProductId,
  attemptChallenge,
};
