import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';
import { decodeCursor, encodeCursor } from './cursor.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: 'CodeVector Products API is running',
    endpoints: {
      products: '/products?limit=20&category=Electronics&cursor=...',
      categories: '/categories',
      health: '/health'
    }
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { category: 'asc' }
    });

    res.json({
      categories: categories.map((item) => ({
        name: item.category,
        count: item._count.category
      }))
    });
  } catch (error) {
    next(error);
  }
});

app.get('/products', async (req, res, next) => {
  try {
    const rawLimit = Number(req.query.limit || 20);
    const limit = Math.min(Math.max(rawLimit || 20, 1), 100);
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : undefined;
    const cursor = typeof req.query.cursor === 'string' ? decodeCursor(req.query.cursor) : null;

    const where = {};

    if (category) {
      where.category = category;
    }

    // Keyset condition for stable pagination.
    // Sort order is newest first: updatedAt DESC, id DESC.
    // Next page asks for rows strictly older than the last seen row.
    if (cursor) {
      where.OR = [
        { updatedAt: { lt: cursor.updatedAt } },
        {
          updatedAt: cursor.updatedAt,
          id: { lt: cursor.id }
        }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { updatedAt: 'desc' },
        { id: 'desc' }
      ],
      take: limit + 1,
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const hasMore = products.length > limit;
    const items = hasMore ? products.slice(0, limit) : products;
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1]) : null;

    res.json({
      data: items,
      pageInfo: {
        limit,
        hasMore,
        nextCursor
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper endpoint to test changing data while browsing.
app.post('/products', async (req, res, next) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: 'name, category and price are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        price: Number(price)
      }
    });

    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal Server Error'
  });
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
