// Products Controller
// Handles all product-related business logic

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/products
 * Returns paginated list with optional search and category filter
 */
const getProducts = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build dynamic where clause
    const where = {};

    // Search filter - case insensitive match on name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Valid sort fields to prevent SQL injection
    const validSortFields = ['price', 'rating', 'createdAt', 'name', 'reviewCount'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          category: true,
          images: true,
          rating: true,
          reviewCount: true,
          brand: true
        }
      }),
      prisma.product.count({ where })
    ]);

    // Get all unique categories for filter sidebar
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      },
      categories: categories.map(c => ({
        name: c.category,
        count: c._count.category
      }))
    });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

/**
 * GET /api/products/:id
 * Returns full product details including specs
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

module.exports = { getProducts, getProductById };
