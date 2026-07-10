import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateConversationDto {
  @ApiProperty({
    description: 'The title or name of the conversation group',
    example: 'Project Alpha Discussion',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title!: string;
}
