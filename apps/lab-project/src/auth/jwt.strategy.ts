import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { prisma } from '../prisma/prisma.client';
import { JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    console.log('=== validate() called, payload:', payload);
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    console.log('=== session found:', !!session);

    if (!session || session.user.deletedAt) {
      throw new UnauthorizedException('Session expired');
    }

    if (session.expiresAt && session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Session expired');
    }
    const clientToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!clientToken || session.token !== clientToken) {
      throw new UnauthorizedException('Token has been invalidated or revoked');
    }

    return {
      userId: payload.userId,
      sessionId: payload.sessionId,
      email: session.user.email,
      username: session.user.username,
      organizationId: session.user.organizationId,
    };
  }
}
