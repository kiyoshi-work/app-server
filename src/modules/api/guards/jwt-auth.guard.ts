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
export class JwtAuthGuard implements CanActivate {
  @Inject(UserRepository)
  private userRepository: UserRepository;
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!process.env.APP_ENV || process.env.APP_ENV === 'local') {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    let token = this.extractTokenFromCookies(request);
    if (!token) {
      token = this.extractTokenFromHeader(request);
    }
    if (!token) {
      throw new UnauthorizedException('access token not found');
    }
    try {
      const payload: TJWTPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('auth.key.jwt_secret_key'),
      });
      if (!(await this.userRepository.exists({ where: { id: payload.sub } }))) {
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

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    const cookies = request?.['cookies'];
    return cookies?.access_token;
  }
}
