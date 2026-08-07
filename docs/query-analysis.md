# Query Analysis

## Dataset Summary

`note: this is continuation of previous assignment, where performance is already somewhat optimized with indexes`

Organizations: 10

Users: 1000

Conversations: 5000

Messages: 50000

Sessions: 500

## Query 1 — Find User by Email

### Query

```sql
EXPLAIN ANALYZE
SELECT *
FROM "User"
WHERE email = 'user500@gmail.com';
```

### Execution Plan

```text
Index Scan using "User_email_key" on "User"

Execution Time: 3.299 ms
```

### Initial Observations

- PostgreSQL uses the unique index created for email.
- No sequential scans.
- Query seems already optimized.

---

## Query 2 — List Organization Users

### Query

```sql
EXPLAIN ANALYZE
SELECT *
FROM "User"
WHERE "organizationId" = '<organization_id>';
```

### Execution Plan

```
Bitmap Heap Scan on "User"

Bitmap Index Scan on "User_organizationId_idx"

Execution Time: 1.125 ms
```

### Initial Observations

- Bitmap Heap Scan.
- PostgreSQL uses the existing index on organizationId.
- Query performs efficiently.

---

## Query 3 — List User Conversations

### Query

```sql
EXPLAIN ANALYZE
SELECT *
FROM "Conversation"
WHERE "ownerId" = '<user_id>'
ORDER BY "createdAt" DESC;
```

### Execution Plan

```text
Bitmap Heap Scan on "Conversation"

Bitmap Index Scan on "Conversation_ownerId_idx"

Sort Key:
"createdAt" DESC

Sort Method:
quicksort

Execution Time:
2.919 ms
```

### Initial Observations

- Existing index is used for filtering.
- PostgreSQL does extra work for sort operation.
- Composite indexing should improve performance.

### After Optimization

change: added composite index on createdAt

```text
Bitmap Heap Scan on "Message"

Bitmap Index Scan on "Conversation_ownerId_createdAt_idx"

Execution Time:
1.188 ms
```

## Conclusion

PostgreSQL switched to the composite index which reduced execution time.

---

## Query 4 — List Conversation Messages

### Query

```sql
EXPLAIN ANALYZE
SELECT *
FROM "Message"
WHERE "conversationId" = '<conversation_id>'
ORDER BY "createdAt" DESC;
```

### Execution Plan

```text
Bitmap Heap Scan on "Message"

Bitmap Index Scan on "Message_conversationId_idx"

Sort Key:
"createdAt" DESC

Execution Time:
19.785 ms
```

### Initial Observations

- Query uses the index on conversationId.
- PostgreSQL performs an additional sort.
- Composite indexing should improve performance.

### After Optimization

change: added composite index on createdAt

```text
Bitmap Heap Scan on "Message"

Bitmap Index Scan on "Message_conversationId_createdAt_idx"

Execution Time:
9.568 ms
```

## Conclusion


PostgreSQL switched to the composite index which reduced execution time.

## Query 5 — List Active Sessions

### Query

```sql
EXPLAIN ANALYZE
SELECT *
FROM "Session"
WHERE "expiresAt" > NOW();
```

### Execution Plan

```text
Seq Scan on "Session"

Filter:
("expiresAt" > now())

Execution Time:
3.748 ms
```

### Initial Observations

- PostgreSQL performs a sequential scan.
- No index exists on `expiresAt`.
- Adding an index on `expiresAt` could improve query performance for larger datasets.

### After Optimization

change: added index on expiresAt

```text
Seq Scan on "Session"

Execution Time:
1.154 ms
```

## Conclusion


PostgreSQL continued using a Sequential Scan, because all sessions in database are active. Based on Postgres not changing the plan, we can assume the improvement in time was because of other factors like cache.