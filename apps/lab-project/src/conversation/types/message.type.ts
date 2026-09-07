import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.type';
// import { ConversationType } from './conversation.type';

@ObjectType('Message')
export class MessageType {
  @Field(() => ID)
  id!: string;

  @Field()
  content!: string;

  @Field()
  senderId!: string;

  @Field(() => User, { nullable: true })
  sender?: User;

  @Field()
  conversationId!: string;

  // @Field(() => ConversationType)
  // conversation?: ConversationType;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
