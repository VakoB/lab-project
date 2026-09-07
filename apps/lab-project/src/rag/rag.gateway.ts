import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '../prisma/prisma.client';

export interface JwtPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
@WebSocketGateway({ namespace: '/rag', cors: true })
export class RagGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(socket: Socket) {
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

    await socket.join(`rag:org:${session.user.organizationId}`);
  }

  notifyStatus(
    organizationId: string,
    payload: {
      fileId: string;
      jobId: string;
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      chunkCount?: number;
      errorMessage?: string;
    },
  ) {
    this.server
      .to(`rag:org:${organizationId}`)
      .emit('rag:document:status', payload);
  }
}
