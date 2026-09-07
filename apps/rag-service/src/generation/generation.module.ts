import { Module } from '@nestjs/common';
import { GenerationController } from './generation.container';
import { GenerationService } from './generation.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { QdrantService } from '../qdrant/qdrant.service';

@Module({
  imports: [],
  controllers: [GenerationController],
  providers: [GenerationService, EmbeddingsService, QdrantService],
})
export class GenerationModule {}
