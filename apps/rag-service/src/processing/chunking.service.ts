import { Injectable } from '@nestjs/common';

export interface Chunk {
  text: string;
  index: number;
}

@Injectable()
export class ChunkingService {
  chunk(text: string, chunkSize = 1500, overlap = 200): Chunk[] {
    const chunks: Chunk[] = [];
    let start = 0;
    let index = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push({ text: text.slice(start, end), index: index++ });
      if (end === text.length) break;
      start = end - overlap;
    }
    return chunks;
  }
}
