import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface User {
  userId: string;
  sessionId: string;
  email: string;
  username: string;
  organizationId: string;
}
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User =>
    ctx.switchToHttp().getRequest().user as User,
);
