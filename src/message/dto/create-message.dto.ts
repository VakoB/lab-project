import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    description: 'The raw text content of the message',
    example: 'Hey, did you finish the assignment yet?',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  content!: string;

  @ApiProperty({
    description: 'The unique ID of the user sending the message',
    example: 'cmr3lds0l02gmcgv5xshbaab4',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  senderId!: string;

  @ApiProperty({
    description: 'The unique ID of the conversation this message belongs to',
    example: 'cmr3ldr9m00fpcgv5x8i0ezei',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  conversationId!: string;
}
