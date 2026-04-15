const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Check if user has purchased product before allowing review
const canReview = async (req, res) => {
  const { productId, email } = req.query;
  const order = await prisma.order.findFirst({
    where: {
      customerEmail: email,
      items: { some: { productId } }
    }
  });
  res.json({ canReview: !!order });
};

// Get all reviews for a product
const getReviews = async (req, res) => {
  const { productId } = req.params;
  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(reviews);
};

// Create a review (only if purchased)
const createReview = async (req, res) => {
  const { productId, email, name, rating, title, body } = req.body;

  // Verify purchase
  const order = await prisma.order.findFirst({
    where: { customerEmail: email, items: { some: { productId } } }
  });
  if (!order) return res.status(403).json({ error: 'Purchase required to review' });

  // Prevent duplicate review
  const existing = await prisma.review.findFirst({ where: { productId, email } });
  if (existing) return res.status(409).json({ error: 'You already reviewed this product' });

  const review = await prisma.review.create({
    data: { productId, email, name, rating, title, body }
  });

  // Update product average rating
  const all = await prisma.review.findMany({ where: { productId }, select: { rating: true } });
  const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
  await prisma.product.update({
    where: { id: productId },
    data: { rating: parseFloat(avg.toFixed(1)), reviewCount: all.length }
  });

  res.status(201).json(review);
};

module.exports = { canReview, getReviews, createReview };