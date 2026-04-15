const prisma = require('../lib/prisma');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const calculateConsumptionRate = async (userId, productId) => {
  const purchases = await prisma.purchaseHistory.findMany({
    where: { userId, productId },
    orderBy: { timestamp: 'asc' },
  });

  if (purchases.length < 2) {
    return null;
  }

  const unitDurations = [];

  for (let index = 1; index < purchases.length; index += 1) {
    const previous = purchases[index - 1];
    const current = purchases[index];
    const daysBetween = Math.max(
      1,
      Math.round((new Date(current.timestamp) - new Date(previous.timestamp)) / MS_PER_DAY)
    );
    unitDurations.push(daysBetween / Math.max(previous.quantity, 1));
  }

  const avgDaysPerUnit =
    unitDurations.reduce((sum, daysPerUnit) => sum + daysPerUnit, 0) / unitDurations.length;

  const lastPurchase = purchases[purchases.length - 1];
  const predictedDaysRemaining = Math.max(1, Math.round(avgDaysPerUnit * Math.max(lastPurchase.quantity, 1)));
  const predictedDepletionDate = new Date(lastPurchase.timestamp);
  predictedDepletionDate.setDate(predictedDepletionDate.getDate() + predictedDaysRemaining);

  return {
    avgDaysBetweenPurchases: Number((avgDaysPerUnit * Math.max(lastPurchase.quantity, 1)).toFixed(1)),
    predictedDepletionDate,
    predictedDaysRemaining,
  };
};

const getReorderSuggestions = async (userId) => {
  const recentProducts = await prisma.purchaseHistory.findMany({
    where: { userId },
    distinct: ['productId'],
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          category: true,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
  });

  const suggestions = [];

  for (const entry of recentProducts) {
    const prediction = await calculateConsumptionRate(userId, entry.productId);
    if (!prediction) continue;

    if (prediction.predictedDaysRemaining <= 10) {
      suggestions.push({
        productId: entry.product.id,
        product: entry.product,
        predictedDepletionDate: prediction.predictedDepletionDate,
        predictedDaysRemaining: prediction.predictedDaysRemaining,
        message: `You'll likely run out in ${prediction.predictedDaysRemaining} day${prediction.predictedDaysRemaining === 1 ? '' : 's'}.`,
      });
    }
  }

  return suggestions.sort((left, right) => left.predictedDaysRemaining - right.predictedDaysRemaining);
};

module.exports = {
  calculateConsumptionRate,
  getReorderSuggestions,
};
