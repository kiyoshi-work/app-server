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
    return await this.authService.authUrl();
  }

  @ApiBaseResponse(class {}, {
    statusCode: HttpStatus.OK,
    isArray: false,
    isPaginate: false,
  })
  @Post('twitter/login')
  async login(@Body() dto: TwitterOauthDto) {
    return await this.authService.login(dto);
  }
}
