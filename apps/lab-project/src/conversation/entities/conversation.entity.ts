import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ConversationEntity {
  @ApiProperty({
    description: 'The unique identification key of the conversation record',
    example: 'cmr3ldr9m00fpcgv5x8i0ezei',
    type: String,
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'The title or name assigned to the conversation group',
    example: 'Project Alpha Discussion',
    type: String,
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'The unique identification key of the conversation owner',
    example: 'cmr3lds0l02gmcgv5xshbaab4',
    type: String,
  })
  @Expose()
  ownerId!: string;

  @ApiProperty({
    description:
      'The timestamp marking when the conversation was originally created',
    example: '2026-07-09T22:15:00.000Z',
    type: Date,
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description:
      'The timestamp marking the most recent modification to this conversation record',
    example: '2026-07-09T22:19:59.000Z',
    type: Date,
  })
  @Expose()
  updatedAt!: Date;
}
