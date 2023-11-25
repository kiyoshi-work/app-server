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
import { HttpCacheInterceptor } from '../cache';

@ApiTags('Notification')
@Controller('/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Post()
  async pushNotification(@Body() body: PushNotificationDto) {
    const res = await this.notificationService.pushNotification(body);
    return {
      statusCode: HttpStatus.OK,
      data: res,
      // ...(res && { message: error }),
    };
  }

  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(3000)
  @Get()
  async getNotification(@Query() query: GetNotificationDTO) {
    const result = await this.notificationService.getNotifications(query);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }
}
