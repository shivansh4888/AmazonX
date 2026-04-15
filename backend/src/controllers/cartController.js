const { v4: uuidv4 } = require('uuid');
const prisma = require('../lib/prisma');
const { computeCartTotals, couponIsActive } = require('../services/cartPricingService');
const { getCartConflicts } = require('../services/cartAnalysisService');
const { getUserId } = require('../utils/requestContext');

const cartInclude = {
  appliedCoupon: true,
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          images: true,
          category: true,
          brand: true,
        },
      },
    },
  },
};

const sanitizeAppliedCoupon = async (cart, userId) => {
  if (!cart?.appliedCouponCode) return cart;

  const coupon = cart.appliedCoupon;
  const eligible = couponIsActive(coupon) &&
    (!coupon.userId || coupon.userId === userId) &&
    cart.items.some((item) => !coupon.productId || coupon.productId === item.product.id);

  if (eligible) return cart;

  await prisma.cart.update({
    where: { id: cart.id },
    data: { appliedCouponCode: null },
  });

  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: cartInclude,
  });
};

const serializeCart = async (cart, userId) => {
  const normalizedCart = await sanitizeAppliedCoupon(cart, userId);
  const totals = computeCartTotals(normalizedCart);

  return {
    id: normalizedCart.id,
    items: normalizedCart.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: item.product,
    })),
    ...totals,
  };
};

const getOrCreateCart = async (sessionId) => {
  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: cartInclude,
    });
  }

  return cart;
};

const getCart = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.json({
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        itemCount: 0,
        appliedCoupon: null,
      });
    }

    const cart = await getOrCreateCart(sessionId);
    res.json(await serializeCart(cart, getUserId(req)));
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

const addToCart = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || uuidv4();
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, name: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({ error: 'Product is out of stock' });
    }

    const cart = await getOrCreateCart(sessionId);
    const existingItem = cart.items.find((item) => item.product.id === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ error: `Only ${product.stock} units available` });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({ error: `Only ${product.stock} units available` });
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    const updatedCart = await getOrCreateCart(sessionId);

    res.json({
      success: true,
      message: `${product.name} added to cart`,
      sessionId,
      cart: await serializeCart(updatedCart, getUserId(req)),
    });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const sessionId = req.headers['x-session-id'];

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: { select: { stock: true } },
        cart: { select: { id: true, sessionId: true } },
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.cart.sessionId !== sessionId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({ error: `Only ${cartItem.product.stock} units available` });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    const cart = await prisma.cart.findUnique({
      where: { id: cartItem.cart.id },
      include: cartInclude,
    });

    res.json({
      success: true,
      message: 'Cart updated',
      cart: await serializeCart(cart, getUserId(req)),
    });
  } catch (error) {
    console.error('updateCartItem error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const sessionId = req.headers['x-session-id'];

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: { select: { id: true, sessionId: true } } },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.cart.sessionId !== sessionId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    const cart = await prisma.cart.findUnique({
      where: { id: cartItem.cart.id },
      include: cartInclude,
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: await serializeCart(cart, getUserId(req)),
    });
  } catch (error) {
    console.error('removeFromCart error:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

const clearCart = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const cart = await prisma.cart.findUnique({ where: { sessionId } });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.update({
        where: { id: cart.id },
        data: { appliedCouponCode: null },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('clearCart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

const getConflicts = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) return res.json([]);

    const cart = await getOrCreateCart(sessionId);
    const warnings = await getCartConflicts(cart.items);
    res.json(warnings);
  } catch (error) {
    console.error('getConflicts error:', error);
    res.status(500).json({ error: 'Failed to analyze cart' });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const userId = getUserId(req);
    const { code } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'No active cart session found' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const cart = await getOrCreateCart(sessionId);
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !couponIsActive(coupon)) {
      return res.status(400).json({ error: 'Coupon is invalid or expired' });
    }

    if (coupon.userId !== userId) {
      return res.status(403).json({ error: 'This coupon belongs to a different shopper' });
    }

    const eligible = cart.items.some((item) => !coupon.productId || coupon.productId === item.product.id);
    if (!eligible) {
      return res.status(400).json({ error: 'Add the eligible product to your cart before applying this coupon' });
    }

    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: { appliedCouponCode: coupon.code },
      include: cartInclude,
    });

    res.json({
      success: true,
      message: `${coupon.discountPercent}% discount applied`,
      cart: await serializeCart(updatedCart, userId),
    });
  } catch (error) {
    console.error('applyCoupon error:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getConflicts,
  applyCoupon,
};
