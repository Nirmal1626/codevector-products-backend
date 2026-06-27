# CodeVector Products Backend

Small backend for browsing around 200,000 products with category filtering and fast, stable pagination.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Cursor-based / keyset pagination

## Why cursor pagination?

Offset pagination (`LIMIT/OFFSET`) can become slow on large tables and can show duplicate/missing rows when new products are inserted or updated while a user is browsing.

This project uses cursor pagination with:

```txt
updated_at DESC, id DESC
```

The cursor stores the last product's `updatedAt` and `id`. The next request fetches rows strictly after that cursor in the sorted order:

```sql
WHERE updated_at < cursorUpdatedAt
   OR (updated_at = cursorUpdatedAt AND id < cursorId)
ORDER BY updated_at DESC, id DESC
LIMIT n + 1
```

This avoids duplicates and missed products during browsing.

## API Endpoints

### Health

```http
GET /health
```

### Categories

```http
GET /categories
```

### Products

```http
GET /products?limit=20
GET /products?limit=20&category=Electronics
GET /products?limit=20&cursor=<nextCursor>
```

Example response:

```json
{
  "data": [
    {
      "id": "...",
      "name": "Electronics Product 1",
      "category": "Electronics",
      "price": "108.90",
      "createdAt": "2026-06-27T10:00:00.000Z",
      "updatedAt": "2026-06-27T10:00:00.000Z"
    }
  ],
  "pageInfo": {
    "limit": 20,
    "hasMore": true,
    "nextCursor": "..."
  }
}
```

### Create Product

This is included to test changing data while browsing.

```http
POST /products
Content-Type: application/json

{
  "name": "New Product",
  "category": "Electronics",
  "price": 999
}
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Create `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
PORT=5000
```

### 3. Run migration

```bash
npx prisma migrate dev --name init
```

### 4. Seed 200,000 products

```bash
npm run seed
```

### 5. Run server

```bash
npm run dev
```

## Deployment

Recommended free setup:

- Backend: Render Web Service
- Database: Neon PostgreSQL

Render commands:

```bash
Build Command: npm install && npx prisma generate && npx prisma migrate deploy
Start Command: npm start
```

After deployment, run seed locally against the Neon `DATABASE_URL`, or use Render Shell if available:

```bash
npm run seed
```

## What I would improve with more time

- Add automated tests for pagination edge cases.
- Add request validation using Zod.
- Add rate limiting and structured logging.
- Add a small frontend UI for browsing products.
- Add admin-only endpoints for product updates.

## AI Usage Note

I used AI to help structure the project, explain cursor pagination tradeoffs, generate boilerplate code, and draft documentation. I reviewed the important pagination logic myself because the main requirement is correctness while data changes.
