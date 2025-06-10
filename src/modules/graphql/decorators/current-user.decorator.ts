import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TJWTPayload } from '@/shared/types';

export const GqlCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): TJWTPayload => {
    const ctx = GqlExecutionContext.create(context);
    return (
      ctx.getContext().req.user || {
        sub: 'cad5500d-7cd4-4fb2-8da0-d12b8bd815a8',
        address: '',
      }
    );
  },
);
