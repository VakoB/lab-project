import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationEntity {
  @ApiProperty({
    description: 'The unique identification key of the organization record',
    example: 'cmr3led1a00a1cgv5y9abc123',
    type: String,
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'The formal name assigned to the organization',
    example: 'Acme Corporation',
    type: String,
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description:
      'The timestamp marking when the organization record was originally created',
    example: '2026-07-09T22:20:00.000Z',
    type: Date,
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description:
      'The timestamp marking the most recent modification to this organization record',
    example: '2026-07-09T22:23:00.000Z',
    type: Date,
  })
  @Expose()
  updatedAt!: Date;
}
