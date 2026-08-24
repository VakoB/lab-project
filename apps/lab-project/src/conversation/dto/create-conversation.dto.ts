import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateConversationDto {
  @ApiProperty({
    description: 'The title or name of the conversation group',
    example: 'Project Alpha Discussion',
    type: String,
  })
  @Field({ nullable: true, defaultValue: 'Chat' })
  @IsString()
  @IsOptional()
  title?: string;

  // @ApiProperty({
  //   description: 'The unique ID of the user who owns/creates this conversation',
  //   example: 'cmr3lds0l02gmcgv5xshbaab4',
  //   type: String,
  // })
  // @Field()
  // @IsString()
  // @IsNotEmpty()
  // ownerId!: string;

  @ApiProperty({
    description:
      'The unique ID of the organization which owns this conversation',
    example: 'cmr3lds0l02gmcgv5xshbaab4',
    type: String,
  })
  @Field()
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @ApiProperty({
    description:
      'The unique ID of the participant which user takes part in conversation with',
    example: 'cmr3lds0l02gmcgv5xshbaab4',
    type: String,
  })
  @Field()
  @IsString()
  @IsNotEmpty()
  participantId!: string;
}
