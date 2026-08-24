import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationGateway } from './conversation.gateway';
import { ConversationResolver } from './conversation.resolver';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [ConversationService, ConversationGateway, ConversationResolver],
  exports: [ConversationService],
})
export class ConversationModule {}
