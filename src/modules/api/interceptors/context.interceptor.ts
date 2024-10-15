import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.body && request.client_req) {
      request.body.context = {
        user: request.user,
      };
    } else {
      if (!process.env.APP_ENV)
        request.body.context = {
          user: {
            sub: 'cad5500d-7cd4-4fb2-8da0-d12b8bd815a8',
            address: '',
          },
        };
    }

    return next.handle();
  }
}
