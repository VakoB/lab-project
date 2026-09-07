import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MessageEntity {
  @ApiProperty({
    description: 'The unique identification key of the message record',
    example: 'cmr3ldrzt017icgv5umbbedw9',
    type: String,
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'The textual content delivered within the message instance',
    example: 'Hey, did you finish the assignment yet?',
    type: String,
  })
  @Expose()
  content!: string;

  @ApiProperty({
    description: 'The unique identification key of the sender user',
    example: 'cmr3lds0l02gmcgv5xshbaab4',
    type: String,
  })
  @Expose()
  senderId!: string;

  @ApiProperty({
    description:
      'The unique identification key of the parent conversation container',
    example: 'cmr3ldr9m00fpcgv5x8i0ezei',
    type: String,
  })
  @Expose()
  conversationId!: string;
}
