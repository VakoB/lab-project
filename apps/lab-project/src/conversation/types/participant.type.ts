import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.type';

@ObjectType('Participant')
export class ParticipantType {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  conversationId!: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  joinedAt!: Date;
}
