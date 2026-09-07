import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description:
      'The unique identification key of the organization the user belongs to',
    example: 'cmr3led1a00a1cgv5y9abc123',
    type: String,
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({
    description: 'The chosen handle or unique username for profile visibility',
    example: 'john_doe',
    minLength: 2,
    type: String,
  })
  @IsString()
  @MinLength(2)
  username!: string;

  @ApiProperty({
    description:
      'The unique electronic mail address associated with the user account',
    example: 'john.doe@example.com',
    type: String,
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'The plain-text password chosen by the user',
    example: 'super-secure-password-123',
    minLength: 8,
    type: String,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
