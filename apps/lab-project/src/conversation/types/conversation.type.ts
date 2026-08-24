import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MessageType } from './message.type';
import { ParticipantType } from './participant.type';

@ObjectType('Conversation')
export class ConversationType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  organizationId!: string;

  @Field()
  ownerId!: string;

  @Field(() => [MessageType], { nullable: true })
  messages?: MessageType[];

  @Field(() => [ParticipantType], { nullable: true })
  participants?: ParticipantType[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
