# JSON Payload Optimization
 
## Tested Endpoint

GET http://localhost:3000/messages?conversationId=c_id&take=20&cursor=m_id

Reason - potentially returns large json response, because Messages are created often and contains string field, that can be large.

## Method

ran each configuration in Postman 10 times in a row and averaged them for more precise result.

## Optimization Applied
 
Restricted the Prisma to only query the fields the client uses, instead of fetching every column:
 
```typescript
// before
const messages = await prisma.message.findMany({
  where: { deletedAt: null, conversationId },
  take, skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { id: 'asc' },
});
 
// after
const messages = await prisma.message.findMany({
  where: { deletedAt: null, conversationId },
  take, skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { id: 'asc' },
  select: { id: true, content: true, senderId: true, conversationId: true },
});
```

Unused columns (`createdAt`, `updatedAt`, `deletedAt`) were previousy being fetched

## Results

average: 15ms

after: 11ms




