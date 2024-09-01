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
            sub: 'd470ccc9-fa52-4e51-8ee5-46f8992b9ab7',
            address: '',
          },
        };
    }

    return next.handle();
  }
}
