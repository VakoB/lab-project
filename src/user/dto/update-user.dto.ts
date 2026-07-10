import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The chosen handle or unique username for profile visibility',
    example: 'john_doe',
    minLength: 2,
    type: String,
  })
  @IsString()
  @MinLength(2)
  username!: string;
}
