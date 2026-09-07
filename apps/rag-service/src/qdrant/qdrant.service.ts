import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

const COLLECTION_NAME = 'document_chunks';
const VECTOR_SIZE = 768;

@Injectable()
export class QdrantService implements OnModuleInit {
  client = new QdrantClient({
    url: process.env.QDRANT_URL ?? 'http://localhost:6333',
  });

  async onModuleInit() {
    const collections = await this.client.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === COLLECTION_NAME,
    );
    if (!exists) {
      await this.client.createCollection(COLLECTION_NAME, {
        vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
      });
    }
  }

  async upsertChunks(
    points: { id: string; vector: number[]; payload: Record<string, any> }[],
  ) {
    await this.client.upsert(COLLECTION_NAME, { points });
  }

  search(vector: number[], limit: number, filter?: Record<string, any>) {
    return this.client.query(COLLECTION_NAME, {
      query: vector,
      limit,
      filter,
      with_payload: true,
    });
  }
}

export { COLLECTION_NAME };
