// Cart Controller
// Manages shopping cart operations using session-based cart (no auth required)
// Each browser session gets its own cart via a sessionId stored in client

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

/**
 * Helper: Get or create cart for a session
 */
const getOrCreateCart = async (sessionId) => {
  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              images: true,
              category: true
            }
          }
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }

  return cart;
};

/**
 * GET /api/cart
 * Returns the current cart with items and totals
 */
const getCart = async (req, res) => {
  try {
    // sessionId comes from header (set by frontend on first load)
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.json({ items: [], subtotal: 0, itemCount: 0 });
    }

    const cart = await getOrCreateCart(sessionId);

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      id: cart.id,
      items: cart.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: item.product
      })),
      subtotal,
      itemCount
    });
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

/**
 * POST /api/cart
 * Add item to cart or increment quantity if already exists
 */
const addToCart = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || uuidv4();
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    // Validate product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, name: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({ error: 'Product is out of stock' });
    }

    const cart = await getOrCreateCart(sessionId);

    // Check if item already in cart
    const existingItem = cart.items.find(i => i.product.id === productId);
    
    if (existingItem) {
      // Validate stock for total quantity
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({ 
          error: `Only ${product.stock} units available` 
        });
      }

      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty }
      });
    } else {
      // Add new item
      if (quantity > product.stock) {
        return res.status(400).json({ 
          error: `Only ${product.stock} units available` 
        });
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        }
      });
    }

    // Return updated cart
    const updatedCart = await getOrCreateCart(sessionId);
    const subtotal = updatedCart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );

    res.json({
      success: true,
      message: `${product.name} added to cart`,
      sessionId, // Return sessionId so frontend can store it
      cart: {
        id: updatedCart.id,
        items: updatedCart.items,
        subtotal,
        itemCount: updatedCart.items.reduce((s, i) => s + i.quantity, 0)
      }
    });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

/**
 * PUT /api/cart/:itemId
 * Update cart item quantity
 */
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const sessionId = req.headers['x-session-id'];

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Get cart item with product info
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: { select: { stock: true, name: true } },
        cart: { select: { sessionId: true } }
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Security: ensure this item belongs to the requester's cart
    if (cartItem.cart.sessionId !== sessionId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check stock availability
    if (quantity > cartItem.product.stock) {
      return res.status(400).json({ 
        error: `Only ${cartItem.product.stock} units available` 
      });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });

    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('updateCartItem error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
};

/**
 * DELETE /api/cart/:itemId
 * Remove item from cart
 */
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const sessionId = req.headers['x-session-id'];

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: { select: { sessionId: true } } }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.cart.sessionId !== sessionId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('removeFromCart error:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

/**
 * DELETE /api/cart
 * Clear entire cart (called after successful order)
 */
const clearCart = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    const cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('clearCart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
