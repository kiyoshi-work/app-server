import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TJWTPayload } from '../constants/types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TJWTPayload => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request?.user || {
        sub: 'd470ccc9-fa52-4e51-8ee5-46f8992b9ab7',
        address: '',
      }
    );
  },
);
