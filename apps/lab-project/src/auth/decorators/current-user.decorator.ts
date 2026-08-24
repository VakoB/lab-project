import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface User {
  userId: string;
  sessionId: string;
  email: string;
  username: string;
  organizationId: string;
}

interface RequestWithUser extends Request {
  user: User;
}

interface GraphQLContext {
  req: RequestWithUser;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    // Graphql
    if (ctx.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(ctx);
      const { req } = gqlContext.getContext<GraphQLContext>();
      return req.user;
    }

    // REST
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return req.user;
  },
);
