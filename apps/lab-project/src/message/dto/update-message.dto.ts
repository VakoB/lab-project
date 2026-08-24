import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateMessageDto {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  messageId!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  content!: string;
}
