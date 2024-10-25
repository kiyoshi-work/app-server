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
  UseInterceptors,
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
import { TDevice, TJWTPayload } from '@/shared/types';
import { DemoDTO } from '../dtos/demo-validator.dto';
import { DemoValidatePipe } from '../validators';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { ContextInterceptor } from '../interceptors/context.interceptor';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import {
  DeviceInterceptor,
  FormatResponseInterceptor,
  HttpCacheInterceptor,
} from '../interceptors';
import { CacheTTL } from '@nestjs/cache-manager';
import { CustomThrottlerGuard } from '../guards/custom-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import {
  BulkheadStrategy,
  CacheStrategy,
  ResilienceFactory,
  RetryStrategy,
  sleep,
  ThrottleStrategy,
  TimeoutStrategy,
  UseResilience,
} from 'nestjs-resilience';
import { DeviceLogsDecorator } from '@/shared/decorators/device-logs.decorator';
import { WorkerThreadService } from '@/worker-thread/worker-thread.service';
import { primes } from '@/modules/worker-thread/tasks/list-primes.task';

@ApiTags('Health')
@Controller('/health')
@UseInterceptors(ContextInterceptor)
export class HealthController {
  constructor(
    @Inject('APP_FIRESTORE')
    private appFirestoreRepository: AppFirestoreRepository,
    private readonly rabbitMqService: RabbitMQService,
    private readonly queueService: QueueService,
    private readonly redisMQService: RedisMQService,
    private readonly workerThreadService: WorkerThreadService,
    private readonly bot: TelegramBot,
  ) {}

  @ApiBearerAuth()
  @Roles(['OPERATOR', 'ADMIN'])
  @UseGuards(AdminGuard)
  @Get('/firebase')
  async firebaseCheck() {
    const res = await this.appFirestoreRepository.testConnection();
    return res;
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

  @Post('test-validator')
  @ApiBaseResponse(class {}, {
    statusCode: HttpStatus.OK,
    isArray: false,
    isPaginate: false,
  })
  @ResponseMessage('Get demo dto successfully')
  @UseInterceptors(FormatResponseInterceptor)
  @UseInterceptors(HttpCacheInterceptor)
  @UseInterceptors(DeviceInterceptor)
  @CacheTTL(3000)
  @UseGuards(CustomThrottlerGuard)
  @Throttle(10, 60)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createCampaign(
    @DeviceLogsDecorator() device: TDevice,
    @Body(DemoValidatePipe) body: DemoDTO,
  ) {
    await this.health();
    return { body, device };
  }

  @UseResilience(
    // new TimeoutStrategy(1000),
    new RetryStrategy({ maxRetries: 4 }),
    new ThrottleStrategy({ ttl: 50000, limit: 2 }),
    new CacheStrategy(3000),
    new BulkheadStrategy({ maxConcurrent: 5, maxQueue: 2 }),
  )
  async health() {
    // await sleep(1000);
    console.log('object');
    // throw new Error('hehe');
    return 1;
  }

  @Get('/test-worker-thread')
  async testWorkerThread() {
    // return primes(10000000);
    return this.workerThreadService.runPrimesWorker(10000000);
  }
}
