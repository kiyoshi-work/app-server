import { TDevice } from '@/shared/types';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class DeviceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request['device-logs']) {
      return next.handle();
    }
    const userAgent = request.headers['user-agent'];
    const ip =
      (request?.headers['x-forwarded-for'] || '').split(',')[0] || request.ip;
    request['device-logs'] = { user_agent: userAgent, ip } as TDevice;
    return next.handle();
  }
}
