import { AppFirestoreRepository } from '@/modules/firebase';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { RabbitMQService, RedisMQService } from '@/transporter/services';
import { QueueService } from '@/modules/queue/queue.service';
import { TelegramBot } from '@/modules/telegram-bot/telegram-bot';
import { MainPage, WelcomePage } from '@/modules/telegram-bot/ui/pages';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/user.decorator';
import { TJWTPayload } from '@/shared/constants/types';
import { VerifyAuthenticatorDTO } from '../dtos/verify-authenticator-secret.dto';
import { DemoValidatePipe } from '../validators';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  constructor(
    @Inject('APP_FIRESTORE')
    private appFirestoreRepository: AppFirestoreRepository,
    private readonly rabbitMqService: RabbitMQService,
    private readonly queueService: QueueService,
    private readonly redisMQService: RedisMQService,
    private readonly bot: TelegramBot,
  ) {}

  @ApiBearerAuth()
  @Roles(['OPERATOR', 'ADMIN'])
  @UseGuards(AdminGuard)
  @Get('/firebase')
  async firebaseCheck() {
    const res = await this.appFirestoreRepository.testConnection();
    return {
      statusCode: HttpStatus.OK,
      data: res,
    };
  }

  async funErr() {
    const response = await fetch('https://api.example.com/data');
    // throw new ForbiddenException('TEST SENTRY 111');
  }

  @ResponseMessage('Health check')
  @Get('')
  async healthCheck() {
    return 1;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('test-auth')
  testAuth(
    @CurrentUser() user: TJWTPayload,
    @Body(DemoValidatePipe) data: VerifyAuthenticatorDTO,
  ) {
    console.log(user);
    return true;
  }

  @Get('telegram-bot')
  async botTest() {
    return await this.bot.sendPagePhoto(
      5665860415,
      new WelcomePage().build({}),
    );
  }

  @Get('throw')
  async throwError() {
    await this.funErr();
  }

  @Post('/test-bullqueue')
  async testBull() {
    await this.queueService.testUserQueue(2000);
  }

  @Post('/rmq')
  async testrmq() {
    // const t = await this.rabbitMqService.send('TEST_MQ_EVENT', {
    //   test: 1,
    // });
    // return t;
    // this.rabbitMqService.emit('TEST_MQ_EVENT', {
    //   test: 1,
    // });
    return await this.redisMQService.send('TEST_MQ_EVENT', {
      test: 1,
    });
  }
}
