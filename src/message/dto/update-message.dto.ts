import { PartialType, PickType } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(
  PickType(CreateMessageDto, ['content'] as const),
) {}
