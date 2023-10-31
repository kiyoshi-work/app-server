import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@/api/services/auth.service';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @Get('/oauth/tiktok')
  @ApiOperation({ summary: 'Send get oauth request to login with tiktok' })
  async getOauthUrl() {
    const response = await this.authService.getOauthUrl();
    return {
      statusCode: HttpStatus.OK,
      data: response,
    };
  }
}
