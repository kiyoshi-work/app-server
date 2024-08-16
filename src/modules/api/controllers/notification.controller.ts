import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  GetNotificationDTO,
  PushNotificationDto,
} from '../dtos/notification.dto';
import { NotificationService } from '../services/notification.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import {
  FormatResponseInterceptor,
  HttpCacheInterceptor,
} from '../interceptors';

@ApiTags('Notification')
@Controller('/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async pushNotification(@Body() body: PushNotificationDto) {
    const res = await this.notificationService.pushNotification(body);
    return {
      statusCode: HttpStatus.OK,
      data: res,
      // ...(res && { message: error }),
    };
  }

  @ApiBaseResponse(class {}, {
    statusCode: HttpStatus.OK,
    isArray: true,
    isPaginate: true,
  })
  @ResponseMessage('Get your notification successfully')
  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(3000)
  @UseInterceptors(FormatResponseInterceptor)
  @Get()
  async getNotification(@Query() query: GetNotificationDTO) {
    return await this.notificationService.getNotifications(query);
  }
}
