import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'The raw text content of the message',
    example: 'Hey, did you finish the assignment yet?',
    type: String,
  })
  @IsString()
  content!: string;
}
