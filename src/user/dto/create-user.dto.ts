import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description:
      'The unique identification key of the organization the user belongs to',
    example: 'cmr3led1a00a1cgv5y9abc123',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  organizationId!: string;

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
    description:
      'The securely processed or hashed password string for authentication integrity',
    example: '$2b$10$UnIqUeHaShInGsTrInGvAlUeHeRe...',
    minLength: 8,
    type: String,
  })
  @IsString()
  @MinLength(8)
  passwordHash!: string;
}
