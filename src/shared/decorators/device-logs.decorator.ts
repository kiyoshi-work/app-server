import { TDevice } from '@/shared/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DeviceLogsDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TDevice => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request?.['device-logs'] || {
        ip: '',
        userAgent: '',
      }
    );
  },
);
