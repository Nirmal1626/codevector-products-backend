# CodeVector Internship – Backend Take Home Task

## Overview

This project is a backend application built for the CodeVector Internship take-home assignment.

The application allows users to:

- Browse approximately 200,000 products
- View products in newest-first order
- Filter products by category
- Navigate using cursor-based pagination
- Continue browsing correctly even when new products are added while users are viewing data

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL (Neon)
- Prisma ORM
- Render (Deployment)

---

## API Endpoints

### Health Check

GET /health

### List Products

GET /products

Query Parameters

- limit (default: 20, max: 100)
- category
- cursor

Example

```
GET /products?limit=20
```

```
GET /products?category=Electronics&limit=20
```

```
GET /products?limit=20&cursor=<nextCursor>
```

---

### Categories

GET /categories

---

## Pagination Strategy

This project uses **cursor (keyset) pagination** instead of offset pagination.

Products are ordered by:

1. updatedAt (Descending)
2. id (Descending)

The cursor contains:

- updatedAt
- id

This approach ensures stable pagination and avoids duplicate or skipped products when new records are inserted while users are browsing.

---

## Database

The database contains approximately **200,000 generated products**.

Each product includes:

- id
- name
- category
- price
- createdAt
- updatedAt

A seed script is included to generate the dataset efficiently.

---

## Running Locally

Install dependencies

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Apply migrations

```bash
npx prisma migrate dev
```

Run seed script

```bash
npm run seed
```

Start server

```bash
npm run dev
```

---

## Live Deployment

Backend:

```
https://codevector-products-backend-6hfg.onrender.com
```

Health Check

```
https://codevector-products-backend-6hfg.onrender.com/health
```

---

## Design Decisions

- Prisma was chosen for type-safe database access and migrations.
- PostgreSQL was chosen because it supports efficient indexing and ordering for large datasets.
- Cursor pagination was chosen over offset pagination because it scales better and remains consistent while data changes.
- The seed script inserts products in batches for better performance.

---

## Improvements With More Time

If I had more time, I would add:

- Swagger / OpenAPI documentation
- Automated tests
- Request validation
- Response caching
- Docker support
- Rate limiting
- CI/CD pipeline

---

## AI Usage

AI was used as a development assistant for brainstorming implementation ideas, clarifying concepts, and speeding up routine coding tasks.

The overall architecture, debugging, integration, testing, deployment, and understanding of the implementation were completed by me. I verified the behavior of the APIs, fixed issues encountered during development, and ensured I understood the final solution so I can explain and modify it during the interview.


The working link of the assignment: https://codevector-products-backend-6hfg.onrender.com/

---