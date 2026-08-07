import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'The formal name of the organization instance',
    example: 'Acme Corporation',
    minLength: 2,
    type: String,
  })
  @IsString()
  @MinLength(2)
  name!: string;
}
