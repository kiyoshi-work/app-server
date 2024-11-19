import { UserRepository } from '@/database/repositories';
import { TJWTPayload } from '@/shared/types';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtJRPCAuthGuard implements CanActivate {
  @Inject(UserRepository)
  private userRepository: UserRepository;
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // if (!process.env.APP_ENV || process.env.APP_ENV === 'local') {
    //   return true;
    // }
    const request = context.switchToRpc().getData();
    const token = this.extractTokenFromParams(request);
    if (!token) {
      throw new UnauthorizedException('access token not found');
    }
    try {
      const payload: TJWTPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('auth.key.jwt_secret_key'),
      });
      if (
        !payload.sub ||
        !(await this.userRepository.exists({ where: { id: payload.sub } }))
      ) {
        throw {
          status_code: HttpStatus.UNAUTHORIZED,
          message: `Not found user`,
        };
      }
      request['user'] = { ...payload };
    } catch (err) {
      throw new UnauthorizedException({
        status_code: HttpStatus.UNAUTHORIZED,
        ...err,
      });
    }
    return true;
  }

  private extractTokenFromParams(request: Request): string | undefined {
    return request?.body?.params?.access_token;
  }
}
