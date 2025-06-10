import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '@/database/repositories';
import { TJWTPayload } from '@/shared/types';

@Injectable()
export class JwtGraphQLGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!process.env.APP_ENV || process.env.APP_ENV === 'local') {
      return true;
    }
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload: TJWTPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('auth.key.jwt_secret_key'),
      });

      // Verify user exists
      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Add user to request object
      req.user = {
        ...payload,
        user_id: user.id,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or user not found');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request?.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
