import { ConversationService } from './conversation.service';
import { ConversationType } from './types/conversation.type';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Query, Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthUser {
  userId: string;
  organizationId: string;
}
@Resolver()
@UseGuards(JwtAuthGuard)
export class ConversationResolver {
  constructor(private conversationService: ConversationService) {}

  @Query(() => [ConversationType])
  async myConversations(
    @CurrentUser() user: AuthUser,
  ): Promise<ConversationType[]> {
    return this.conversationService.getUserConversations(
      user.userId,
      user.organizationId,
    );
  }

  @Mutation(() => ConversationType)
  async createConversation(
    @Args('input') input: CreateConversationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.conversationService.createConversation(input, user.userId);
  }

  @Mutation(() => ID)
  async deleteConversation(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.conversationService.deleteConversation(
      conversationId,
      user.userId,
      user.organizationId,
    );
  }
}
