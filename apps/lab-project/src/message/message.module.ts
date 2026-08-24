import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { ConversationModule } from '../conversation/conversation.module';
import { MessageResolver } from './message.resolver';
import { PubSub } from 'graphql-subscriptions';

const pubSubInstance = new PubSub();

@Module({
  imports: [ConversationModule],
  providers: [
    MessageService,
    MessageResolver,
    {
      provide: 'PUB_SUB',
      useValue: pubSubInstance,
    },
  ],
})
export class MessageModule {}
