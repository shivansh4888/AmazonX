const couponIsActive = (coupon) => {
  if (!coupon) return false;
  if (coupon.redeemedAt) return false;
  return new Date(coupon.expiresAt) > new Date();
};

const computeCartTotals = (cart) => {
  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  let discount = 0;
  let appliedCoupon = null;

  if (couponIsActive(cart?.appliedCoupon)) {
    const eligibleSubtotal = items.reduce((sum, item) => {
      if (!cart.appliedCoupon.productId || cart.appliedCoupon.productId === item.product.id) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);

    if (eligibleSubtotal > 0) {
      appliedCoupon = cart.appliedCoupon;
      discount = parseFloat(((eligibleSubtotal * cart.appliedCoupon.discountPercent) / 100).toFixed(2));
    }
  }

  const discountedSubtotal = Math.max(subtotal - discount, 0);
  const tax = parseFloat((discountedSubtotal * 0.18).toFixed(2));
  const shipping = discountedSubtotal >= 500 || discountedSubtotal === 0 ? 0 : 49;
  const total = parseFloat((discountedSubtotal + tax + shipping).toFixed(2));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total,
    itemCount,
    appliedCoupon: appliedCoupon
      ? {
          code: appliedCoupon.code,
          discountPercent: appliedCoupon.discountPercent,
          productId: appliedCoupon.productId,
        }
      : null,
  };
};

module.exports = {
  computeCartTotals,
  couponIsActive,
};
