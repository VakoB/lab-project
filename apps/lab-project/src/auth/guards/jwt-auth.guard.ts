import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext): Request {
    if (context.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext<{ req: Request }>();
      return ctx.req;
    }

    return context.switchToHttp().getRequest<Request>();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('=== canActivate type:', context.getType().toString());
    const req = this.getRequest(context);
    console.log('=== req.headers:', req?.headers);

    if (isPublic) return true;
    return super.canActivate(context);
  }
}
