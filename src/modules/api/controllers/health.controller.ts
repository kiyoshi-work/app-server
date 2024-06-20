import { AppFirestoreRepository } from '@/modules/firebase';
import {
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
import { RabbitMQService } from '@/modules/rabbitmq/rabbitmq.service';

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  constructor(
    @Inject('APP_FIRESTORE')
    private appFirestoreRepository: AppFirestoreRepository,
    private readonly rabbitMqService: RabbitMQService,
  ) { }

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
  @Get('')
  async healthCheck() {
    return 1;
  }

  @Get('throw')
  async throwError() {
    await this.funErr();
  }

  @Post('/rmq')
  async testrmq() {
    this.rabbitMqService.emit('TEST_MQ_EVENT', {
      test: 1,
    });
  }
}
