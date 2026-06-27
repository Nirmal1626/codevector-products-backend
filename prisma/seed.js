import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TOTAL_PRODUCTS = Number(process.env.SEED_TOTAL || 200000);
const BATCH_SIZE = Number(process.env.SEED_BATCH_SIZE || 5000);

const categories = [
  'Electronics',
  'Fashion',
  'Home',
  'Books',
  'Sports',
  'Beauty',
  'Toys',
  'Groceries'
];

function randomPrice(index) {
  return ((index * 37) % 99999) / 10 + 99;
}

async function main() {
  console.time('seed');
  console.log(`Deleting old products...`);
  await prisma.product.deleteMany();

  console.log(`Creating ${TOTAL_PRODUCTS.toLocaleString()} products in batches of ${BATCH_SIZE}...`);

  const now = Date.now();

  for (let start = 0; start < TOTAL_PRODUCTS; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, TOTAL_PRODUCTS);
    const products = [];

    for (let i = start; i < end; i += 1) {
      const category = categories[i % categories.length];
      const createdAt = new Date(now - i * 1000);
      const updatedAt = new Date(now - i * 1000);

      products.push({
        name: `${category} Product ${i + 1}`,
        category,
        price: randomPrice(i),
        createdAt,
        updatedAt
      });
    }

    await prisma.product.createMany({ data: products });
    console.log(`Inserted ${end.toLocaleString()} / ${TOTAL_PRODUCTS.toLocaleString()}`);
  }

  console.timeEnd('seed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
