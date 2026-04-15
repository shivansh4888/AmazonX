const prisma = require('../lib/prisma');

const normalize = (value) => String(value || '').trim().toLowerCase();

const severityRank = {
  low: 1,
  medium: 2,
  high: 3,
};

const getCartConflicts = async (cartItems) => {
  if (!cartItems?.length) return [];

  const categories = [...new Set(cartItems.map((item) => normalize(item.product.category)))];

  const rules = await prisma.productCompatibilityRule.findMany({
    where: {
      OR: [
        { category: { in: categories } },
        { productId: { in: cartItems.map((item) => item.product.id) } },
      ],
    },
  });

  const warnings = [];

  for (const item of cartItems) {
    const itemCategory = normalize(item.product.category);
    const matchingRules = rules.filter((rule) => {
      const sameCategory = normalize(rule.category) === itemCategory;
      const sameProduct = rule.productId && rule.productId === item.product.id;
      return sameCategory || sameProduct;
    });

    for (const rule of matchingRules) {
      const requiredItems = cartItems.filter((candidate) =>
        rule.requires.some((requiredCategory) => normalize(requiredCategory) === normalize(candidate.product.category))
      );

      if (rule.requires.length && requiredItems.length === 0) {
        warnings.push({
          type: 'missing-complement',
          severity: rule.severity,
          message: `${item.product.name} usually performs best with ${rule.requires.join(' or ')} in the cart.`,
          relatedProductId: item.product.id,
        });
        continue;
      }

      if (rule.minCompatiblePriceRatio && requiredItems.length > 0) {
        const weakestMatch = requiredItems.reduce((lowest, current) => {
          if (!lowest || current.product.price < lowest.product.price) return current;
          return lowest;
        }, null);

        const actualRatio = weakestMatch.product.price / Math.max(item.product.price, 1);

        if (actualRatio < rule.minCompatiblePriceRatio) {
          warnings.push({
            type: 'price-mismatch',
            severity: rule.severity,
            message: rule.warningMessage || `${item.product.name} may be bottlenecked by ${weakestMatch.product.name}.`,
            relatedProductId: item.product.id,
            relatedProductName: weakestMatch.product.name,
          });
        }
      }
    }
  }

  const uniqueWarnings = Array.from(
    new Map(warnings.map((warning) => [`${warning.type}:${warning.message}`, warning])).values()
  );

  return uniqueWarnings.sort(
    (left, right) => (severityRank[right.severity] || 0) - (severityRank[left.severity] || 0)
  );
};

module.exports = {
  getCartConflicts,
};
