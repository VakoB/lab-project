import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LogInDto } from './dto/login.dto';
import { prisma } from 'src/prisma/prisma.client';

export interface JwtPayload {
  userId: string;
  sessionId: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginData: LogInDto) {
    const user = await prisma.user.findFirst({
      where: { email: loginData.email, deletedAt: null },
    });

    if (!user) throw new NotFoundException('Invalid credentials');

    const passwordValid = user.passwordHash === loginData.password;
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: 'Pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const payload: JwtPayload = { userId: user.id, sessionId: session.id };
    const token = this.jwtService.sign(payload);

    await prisma.session.update({ where: { id: session.id }, data: { token } });
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        organizationId: user.organizationId,
      },
    };
  }

  async logOut(sessionId: string) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {
      // already deleted
    });
  }
}
