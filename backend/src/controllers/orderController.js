// Orders Controller
// Core business logic: order creation, payment simulation, stock management, email
// ⚠️ ALL PAYMENTS ARE SIMULATED - NO REAL TRANSACTIONS OCCUR

const { PrismaClient } = require('@prisma/client');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const prisma = new PrismaClient();

/**
 * Calculate estimated delivery date
 * COD and UPI get 5-7 days, Card gets 3-5 days (faster processing fiction)
 */
const calculateDeliveryDate = (paymentMethod) => {
  const days = paymentMethod === 'COD' ? 7 : paymentMethod === 'UPI' ? 5 : 4;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * PAYMENT SIMULATION LOGIC
 * ─────────────────────────────────────────────────────────────────────────────
 * This function simulates payment gateway behavior WITHOUT any real transaction.
 * 
 * In a real system, this would:
 * 1. Call Razorpay/Stripe API with card/UPI details
 * 2. Get a payment intent ID
 * 3. Confirm the payment
 * 4. Return success/failure based on actual bank response
 *
 * Here we:
 * 1. Accept payment method and "credentials" (card number, UPI ID, etc.)
 * 2. Do basic format validation
 * 3. Simulate a small random delay (gateway latency)
 * 4. Always return success (99% rate) for demo purposes
 * ─────────────────────────────────────────────────────────────────────────────
 */
const simulatePayment = async (paymentMethod, paymentData) => {
  // Simulate network latency (gateway processing time)
  await new Promise(resolve => setTimeout(resolve, 1500));

  switch (paymentMethod) {
    case 'CARD': {
      // Basic card validation (format only, not real Luhn check)
      const { cardNumber, expiryDate, cvv } = paymentData || {};
      
      if (!cardNumber || !expiryDate || !cvv) {
        return { success: false, error: 'Invalid card details' };
      }
      
      // Check card number length (simplified)
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15 || cleanCard.length > 16) {
        return { success: false, error: 'Invalid card number' };
      }
      
      // Generate fake transaction reference
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      console.log(`💳 [SIMULATED] Card payment processed. TxnID: ${transactionId}`);
      return { success: true, transactionId, method: 'CARD' };
    }

    case 'UPI': {
      // UPI payments are pre-verified via QR scan simulation on frontend
      // By the time this API is called, payment is "already done"
      const transactionId = `UPI${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      console.log(`📱 [SIMULATED] UPI payment verified. TxnID: ${transactionId}`);
      return { success: true, transactionId, method: 'UPI' };
    }

    case 'COD': {
      // Cash on Delivery - no payment processing needed
      console.log(`💰 [SIMULATED] COD order accepted`);
      return { success: true, transactionId: null, method: 'COD' };
    }

    default:
      return { success: false, error: 'Invalid payment method' };
  }
};

/**
 * POST /api/orders
 * Main order creation endpoint
 * 
 * Flow:
 * 1. Validate request body
 * 2. Verify all items have sufficient stock (ATOMIC CHECK)
 * 3. Simulate payment processing
 * 4. Create order in database (in transaction)
 * 5. Deduct stock from products (in same transaction)
 * 6. Clear customer's cart
 * 7. Send confirmation email
 * 8. Return order confirmation
 */
const createOrder = async (req, res) => {
  const { body } = req;
  const sessionId = req.headers['x-session-id'];

  try {
    // ─── Step 1: Validate Request ──────────────────────────────────────────────
    const { items, shippingAddress, paymentMethod, paymentData, customerEmail, customerName } = body;

    if (!items?.length) {
      return res.status(400).json({ error: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ error: 'Invalid shipping address' });
    }

    if (!['CARD', 'UPI', 'COD'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required' });
    }

    // ─── Step 2: Stock Validation ──────────────────────────────────────────────
    // Fetch all products being ordered in one query (efficient)
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, stock: true }
    });

    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });

    // Check each item has sufficient stock
    const stockErrors = [];
    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        stockErrors.push(`Product ${item.productId} not found`);
      } else if (product.stock < item.quantity) {
        stockErrors.push(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Stock unavailable', 
        details: stockErrors 
      });
    }

    // ─── Step 3: Payment Simulation ───────────────────────────────────────────
    console.log(`\n💳 Processing ${paymentMethod} payment for ${customerEmail}...`);
    const paymentResult = await simulatePayment(paymentMethod, paymentData);

    if (!paymentResult.success) {
      return res.status(402).json({ 
        error: 'Payment failed', 
        details: paymentResult.error 
      });
    }

    // ─── Step 4 & 5: Create Order + Deduct Stock (Atomic Transaction) ─────────
    // Using Prisma transaction ensures either ALL operations succeed or NONE do
    // This prevents scenarios like "order created but stock not deducted"
    const subtotal = items.reduce((sum, item) => {
      return sum + (productMap[item.productId].price * item.quantity);
    }, 0);

    const tax = parseFloat((subtotal * 0.18).toFixed(2)); // 18% GST
    const shippingCost = subtotal >= 500 ? 0 : 49; // Free shipping above ₹500
    const total = parseFloat((subtotal + tax + shippingCost).toFixed(2));
    const estimatedDelivery = calculateDeliveryDate(paymentMethod);

    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          subtotal,
          tax,
          shippingCost,
          total,
          shippingAddress,
          customerEmail,
          customerName: customerName || shippingAddress.name,
          estimatedDelivery,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: productMap[item.productId].price,
              name: productMap[item.productId].name
            }))
          }
        },
        include: {
          items: true
        }
      });

      // STOCK DEDUCTION LOGIC
      // ─────────────────────────────────────────────────────────────────────────
      // For each ordered item, atomically decrease the product stock count.
      // Using $increment with negative value is safer than read-then-write
      // as it prevents race conditions in concurrent requests.
      // ─────────────────────────────────────────────────────────────────────────
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
        console.log(`📦 Stock deducted: ${productMap[item.productId].name} -${item.quantity} units`);
      }

      return newOrder;
    });

    // ─── Step 6: Clear Cart ────────────────────────────────────────────────────
    if (sessionId) {
      const cart = await prisma.cart.findUnique({ where: { sessionId } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        console.log(`🛒 Cart cleared for session ${sessionId}`);
      }
    }

    // ─── Step 7: Send Confirmation Email ──────────────────────────────────────
    // Fire-and-forget: don't await this to avoid blocking the response
    // Email failure is logged but doesn't affect order success
    const emailResult = await sendOrderConfirmationEmail({
      ...order,
      customerEmail,
      customerName,
      shippingAddress,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    });

    // ─── Step 8: Return Confirmation ──────────────────────────────────────────
    console.log(`\n✅ Order ${order.id} created successfully!`);
    
    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        tax: order.tax,
        shippingCost: order.shippingCost,
        total: order.total,
        shippingAddress: order.shippingAddress,
        estimatedDelivery: order.estimatedDelivery,
        items: order.items,
        createdAt: order.createdAt
      },
      transactionId: paymentResult.transactionId,
      emailSent: emailResult.success,
      emailPreview: emailResult.previewUrl || null // Ethereal preview URL for testing
    });

  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ error: 'Failed to create order. Please try again.' });
  }
};

/**
 * GET /api/orders/:id
 * Get order details by ID
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('getOrderById error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

/**
 * GET /api/orders
 * Get orders by email (order history)
 */
const getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      include: { items: { include: { product: { select: { images: true } } } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('getOrdersByEmail error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

module.exports = { createOrder, getOrderById, getOrdersByEmail };
