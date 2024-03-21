import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AdministratorRepository } from '@/modules/database/repositories';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private administratorRepository: AdministratorRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      if(!process.env.APP_ENV){
        return true;
      }
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('auth.key.jwt_secret_key'),
      });
      const roles = this.reflector.get<string[]>('roles', context.getHandler());
      if (!roles) {
        return true;
      }
      const admin = await this.administratorRepository.findOne({
        where: {
          wallet: payload.address,
        },
        relations: ['roles'],
      });
      const hasRole = admin.roles.some((r) => roles.includes(r.name));
      return hasRole;
    } catch (error) {
      return false;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
