import { Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { MessageService } from './message.service';
import { MessageType } from '../conversation/types/message.type';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PubSub } from 'graphql-subscriptions';

const MESSAGE_ADDED = 'MESSAGE_ADDED';
const MESSAGE_UPDATED = 'MESSAGE_UPDATED';
const MESSAGE_DELETED = 'MESSAGE_DELETED';

interface AuthUser {
  userId: string;
  organizationId: string;
}

export interface MessageAddedPayload {
  messageAdded: MessageType;
}
export interface MessageUpdatedPayload {
  messageUpdated: MessageType;
}
export interface MessageDeletedPayload {
  messageDeleted: string;
  conversationId: string;
}
export interface MessageArgs {
  conversationId: string;
}
@UseGuards(JwtAuthGuard)
@Resolver()
export class MessageResolver {
  constructor(
    private messageService: MessageService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}
  @Query(() => [MessageType])
  async conversationMessages(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.messageService.getConversationMessages(
      conversationId,
      user.userId,
      user.organizationId,
    );
    return result.data;
  }

  @Mutation(() => MessageType)
  async sendMessage(
    @Args('input') input: CreateMessageDto,
    @CurrentUser() user: AuthUser,
  ) {
    const message = await this.messageService.sendMessage(user.userId, input);

    await this.pubSub.publish(MESSAGE_ADDED, {
      messageAdded: {
        ...message,
        conversationId: input.conversationId,
      },
    });
    return message;
  }

  @Mutation(() => MessageType)
  async updateMessage(
    @Args('input') input: UpdateMessageDto,
    @CurrentUser() user: AuthUser,
  ) {
    const message = await this.messageService.updateMessage(user.userId, input);

    await this.pubSub.publish(MESSAGE_UPDATED, {
      messageUpdated: message,
    });

    return message;
  }

  @Mutation(() => ID)
  async deleteMessage(
    @Args('messageId', { type: () => ID }) messageId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const { id, conversationId } = await this.messageService.deleteMessage(
      messageId,
      user.userId,
    );

    await this.pubSub.publish(MESSAGE_DELETED, {
      messageDeleted: id,
      conversationId: conversationId,
    });

    return id;
  }

  @Subscription(() => MessageType, {
    filter: (payload: MessageAddedPayload, variables: MessageArgs) => {
      return (
        String(payload?.messageAdded?.conversationId) ===
        String(variables?.conversationId)
      );
    },
  })
  messageAdded(
    @Args('conversationId', { type: () => ID }) conversationId: string,
  ) {
    return this.pubSub.asyncIterableIterator(MESSAGE_ADDED);
  }

  @Subscription(() => MessageType, {
    filter: (payload: MessageUpdatedPayload, variables: MessageArgs) =>
      payload.messageUpdated.conversationId === variables.conversationId,
  })
  messageUpdated(
    @Args('conversationId', { type: () => ID }) conversationId: string,
  ) {
    return this.pubSub.asyncIterableIterator(MESSAGE_UPDATED);
  }

  @Subscription(() => ID, {
    filter: (payload: MessageDeletedPayload, variables: MessageArgs) =>
      payload.conversationId === variables.conversationId,
    resolve: (payload: MessageDeletedPayload) => payload.messageDeleted,
  })
  messageDeleted(
    @Args('conversationId', { type: () => ID }) conversationId: string,
  ) {
    return this.pubSub.asyncIterableIterator(MESSAGE_DELETED);
  }
}
