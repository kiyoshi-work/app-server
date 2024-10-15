import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@/business/services/auth.service';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { TwitterOauthDto } from '../dtos/login.dto';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @Get('twitter/oauth-url')
  @ApiOperation({ summary: 'generate twitter auth url' })
  async getAuthUrl() {
    return await this.authService.authUrl();
  }

  @ApiBaseResponse(class {}, {
    statusCode: HttpStatus.OK,
    isArray: false,
    isPaginate: false,
  })
  @Post('twitter/login')
  async login(@Body() dto: TwitterOauthDto, @Res() res: Response) {
    const resp = await this.authService.login(dto);
    res.cookie('access_token', resp?.access_token, {
      httpOnly: true,
      secure: true,
      maxAge: resp.expires_in,
      sameSite: 'strict',
    });
    return res.json(resp);
  }
}
