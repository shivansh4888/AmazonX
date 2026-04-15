const prisma = require('../lib/prisma');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPriceInsight = async (productId) => {
  const history = await prisma.priceHistory.findMany({
    where: { productId },
    orderBy: { timestamp: 'asc' },
  });

  if (!history.length) {
    return {
      isArtificialDiscount: false,
      message: 'Not enough price history yet.',
      confidence: 0,
      volatilityScore: 0,
      priceIncreasePercent: 0,
      history: [],
    };
  }

  const current = history[history.length - 1];
  const priorEntries = history.slice(0, -1);
  const previousPeak = priorEntries.reduce((peak, entry) => {
    if (!peak || entry.price > peak.price) return entry;
    return peak;
  }, null);
  const baseline = priorEntries.reduce((min, entry) => {
    if (!min || entry.price < min.price) return entry;
    return min;
  }, null);

  const prices = history.map((entry) => entry.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const meanPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const volatilityScore = meanPrice ? Number((((maxPrice - minPrice) / meanPrice) * 100).toFixed(2)) : 0;

  let priceIncreasePercent = 0;
  let isArtificialDiscount = false;
  let message = 'Price movements look normal.';
  let confidence = 0.28;

  if (previousPeak && baseline && previousPeak.price > current.price && previousPeak.price > baseline.price) {
    priceIncreasePercent = Number((((previousPeak.price - baseline.price) / baseline.price) * 100).toFixed(2));
    const daysAgo = Math.max(
      1,
      Math.round((new Date(current.timestamp) - new Date(previousPeak.timestamp)) / (1000 * 60 * 60 * 24))
    );

    if (priceIncreasePercent >= 5) {
      isArtificialDiscount = true;
      confidence = clamp(Number((0.45 + priceIncreasePercent / 100 + volatilityScore / 150).toFixed(2)), 0, 0.99);
      message = `This discount may be artificial (price increased ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago).`;
    }
  }

  return {
    isArtificialDiscount,
    message,
    confidence,
    volatilityScore,
    priceIncreasePercent,
    history: history.map((entry) => ({
      price: entry.price,
      timestamp: entry.timestamp,
    })),
  };
};

module.exports = {
  getPriceInsight,
};
