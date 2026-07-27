import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: 'The title or name of the conversation group',
    example: 'Project Alpha Discussion',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'The unique ID of the user who owns/creates this conversation',
    example: 'cmr3lds0l02gmcgv5xshbaab4',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  ownerId!: string;
}
