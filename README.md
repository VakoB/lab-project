# Lab Project

# Installation

Install dependencies:

```bash
yarn install
```

Generate Prisma Client:

```bash
npx prisma generate
```

Apply migrations:

```bash
npx prisma migrate deploy
```

or during development:

```bash
npx prisma migrate dev
```

---

# Create .env file in the root

use .env.example for a guide

---

# Running PostgreSQL

Start PostgreSQL using Docker Compose:

```bash
docker compose up -d
```

To stop containers:

```bash
docker compose down
```

---

# Seeding Database

seed.ts file is located in `prisma/seed.ts`

Populate the database with test data:

```bash
npx prisma db seed
```

Seeded dataset:

- 10 Organizations
- 1,000 Users
- 500 Sessions
- 5,000 Conversations
- 50,000 Messages

---

# Run the app

```bash
yarn run start:dev
```
The app runs on port 3001

---

# Prisma Studio

Open Prisma Studio to see the seeded data:

```bash
npx prisma studio
```

---


# Query Analysis

Query analysis results are located in:

```text
docs/query-analysis.md
```

Analyzed queries:

- Find User by Email
- List Organization Users
- List User Conversations
- List Conversation Messages
- List Active Sessions

Execution plans were collected using:

```sql
EXPLAIN ANALYZE
```

---

# Pagination

Cursor pagination has been implemented for:

- Users
- Conversations
- Messages

### LIMIT/OFFSET vs Cursor Pagination

LIMIT/OFFSET pagination retrieves data by skipping rows.

Example:

```sql
SELECT *
FROM "User"
LIMIT 20 OFFSET 40;
```

Cursor pagination uses the last retrieved record as a reference point.

Example:

```sql
SELECT *
FROM "User"
WHERE id > 'id123'
ORDER BY id
LIMIT 20;
```

Cursor pagination is more efficient for large datasets because it avoids going through many rows. also, cursor is more resiliant when data changes, but limit/offset can cause duplicate data.

---

# Swagger UI

API Documentation can be access on

```text
http://localhost:3000/api/docs
```

# JSON Payload Optimization

Documentation is available in

```text
docs/json-performace.md
```

# HTTP Error Handling

Standardized error structure documentation is available in

```text
docs/error-handling
```
