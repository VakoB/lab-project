import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { QdrantService } from '../qdrant/qdrant.service';

interface ChunkPayload {
  text: string;
  fileId: string;
  organizationId: string;
  chunkIndex: number;
}

const GENERATION_MODEL = 'gemini-3.6-flash';

@Injectable()
export class GenerationService {
  private readonly ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  constructor(
    private readonly embeddings: EmbeddingsService,
    private readonly qdrant: QdrantService,
  ) {}

  async answer(fileId: string, question: string) {
    const questionVector = await this.embeddings.embed(question);

    const results = await this.qdrant.search(questionVector, 5, {
      must: [{ key: 'fileId', match: { value: fileId } }],
    });

    if (results.points.length === 0) {
      return {
        answer: "I don't have any content to answer that from.",
        sources: [],
      };
    }

    const context = results.points
      .map((r, i) => {
        const payload = r.payload as ChunkPayload | undefined;
        const text = typeof payload?.text === 'string' ? payload.text : '';
        return `[Source ${i + 1}]: ${text}`;
      })
      .join('\n\n');

    const prompt = `You are answering a question using ONLY the sources below. Rules:
- Every factual claim must end with a citation tag like [Source N] matching the source it came from.
- If the sources don't contain the answer, say "I don't know based on the provided document" — do not guess.

${context}

Question: ${question}

Answer (with [Source N] citations):`;

    const result = await this.ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
    });
    const answerText = result.text;

    return {
      answer: answerText,
      sources: results.points.map((r, i) => {
        const payload = r.payload as ChunkPayload | undefined;
        return {
          label: `Source ${i + 1}`,
          chunkIndex: payload?.chunkIndex,
          text: payload?.text,
          score: r.score,
        };
      }),
    };
  }
}
