import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GenerationService } from './generation.service';
import type { FileQuestionMessage } from 'apps/rag-service/messages/file-question.message';

@Controller()
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @MessagePattern('rag.question.ask')
  async ask(@Payload() data: FileQuestionMessage) {
    return this.generationService.answer(data.fileId, data.question);
  }
}
