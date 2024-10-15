import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TJWTPayload } from '../types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TJWTPayload => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request?.user || {
        sub: 'cad5500d-7cd4-4fb2-8da0-d12b8bd815a8',
        address: '',
      }
    );
  },
);
