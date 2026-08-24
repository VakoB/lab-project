/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';

export interface SocketData {
  userId: string;
  organizationId: string;
}

export interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

export interface JwtPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface JoinChatDto {
  conversationId: string;
}

export interface LeaveChatDto {
  conversationId: string;
}

export interface TypingDto {
  conversationId: string;
  isTyping: boolean;
}

export interface DeleteMessageBroadcastDto {
  messageId: string;
}

export interface CustomSocketData {
  userId: string;
  organizationId: string | null;
}

const onlineUsers = new Set<string>();

@WebSocketGateway({
  cors: { origin: 'http://localhost:3000', credentials: true },
  namespace: '/chat',
})
export class ConversationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ConversationGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const authHeader = socket.handshake.headers.authorization;
      const handshakeToken = socket.handshake.auth.token as string | undefined;

      const token = handshakeToken || authHeader?.split(' ')[1];

      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token);

      const session = await prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: { user: true },
      });

      if (!session || session.user.deletedAt) {
        socket.disconnect();
        return;
      }

      const socketData: CustomSocketData = {
        userId: payload.userId,
        organizationId: session.user.organizationId,
      };

      Object.assign(socket.data, socketData);

      onlineUsers.add(payload.userId);

      socket.broadcast.emit('user:online', { userId: payload.userId });

      this.logger.log(`User connected: ${payload.userId}`);
    } catch (error) {
      this.logger.error(
        `Connection authentication failed: ${(error as Error).message}`,
      );
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId as string | undefined;

    if (userId) {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user:offline', { userId });
    }
  }

  @SubscribeMessage('chat:join')
  async handleJoinChat(
    @MessageBody() data: JoinChatDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: data.conversationId,
        userId: socket.data.userId,
      },
    });

    if (!participant) {
      socket.emit('error', {
        message: 'Not a participant in this conversation',
      });
      return;
    }

    await socket.join(data.conversationId);

    socket.to(data.conversationId).emit('chat:user_joined', {
      userId: socket.data.userId,
      conversationId: data.conversationId,
    });

    this.logger.log(
      `User ${socket.data.userId} joined chat ${data.conversationId}`,
    );
  }

  @SubscribeMessage('chat:leave')
  async handleLeaveChat(
    @MessageBody() data: LeaveChatDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    await socket.leave(data.conversationId);

    socket.to(data.conversationId).emit('chat:user_left', {
      userId: socket.data.userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): void {
    socket.to(data.conversationId).emit('chat:typing', {
      userId: socket.data.userId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('users:online')
  handleGetOnlineUsers(@ConnectedSocket() socket: AuthenticatedSocket): void {
    socket.emit('users:online', {
      userIds: Array.from(onlineUsers),
    });
  }
}
