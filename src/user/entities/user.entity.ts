import { Expose, Type } from 'class-transformer';
import { OrganizationEntity } from 'src/organization/entities/organization.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({
    description: 'The unique identification key of the user record',
    example: 'cmr3lds0l02gmcgv5xshbaab4',
    type: String,
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'The unique profile handle or username',
    example: 'john_doe',
    type: String,
  })
  @Expose()
  username!: string;

  @ApiProperty({
    description: 'The primary electronic mail address for the account',
    example: 'john.doe@example.com',
    type: String,
  })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'The unique ID referencing the parent organization record',
    example: 'cmr3led1a00a1cgv5y9abc123',
    type: String,
  })
  @Expose()
  organizationId!: string;

  @ApiProperty({
    description: 'The timestamp marking user profile registration',
    example: '2026-07-09T22:25:00.000Z',
    type: Date,
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description:
      'The timestamp marking the most recent changes made to the profile',
    example: '2026-07-09T22:27:00.000Z',
    type: Date,
  })
  @Expose()
  updatedAt!: Date;

  @ApiProperty({
    description: 'The associated organization record information block',
    type: () => OrganizationEntity,
  })
  @Expose()
  @Type(() => OrganizationEntity)
  organization!: OrganizationEntity;
}
