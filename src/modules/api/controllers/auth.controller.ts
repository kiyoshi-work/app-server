import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@/api/services/auth.service';
import { BaseResponse } from '@/shared/swagger/response/base.response';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { TwitterOauthDto } from '../dtos/login.dto';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @Get('twitter/oauth-url')
  @ApiOperation({ summary: 'generate twitter auth url' })
  async getAuthUrl() {
    const res = await this.authService.authUrl();
    return new BaseResponse(res, HttpStatus.OK);
  }

  @ApiBaseResponse(class { }, {
    statusCode: HttpStatus.OK,
    isArray: false,
    isPaginate: false,
  })
  @Post('twitter/login')
  async login(@Body() dto: TwitterOauthDto) {
    const res = await this.authService.login(dto);
    return new BaseResponse(res, HttpStatus.OK);
  }
}
