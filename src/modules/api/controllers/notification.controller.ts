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
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { BaseResponse } from '@/shared/swagger/response/base.response';

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

  @ApiBaseResponse(class { }, {
    statusCode: HttpStatus.OK,
    isArray: true,
    isPaginate: true,
  })
  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(3000)
  @Get()
  async getNotification(@Query() query: GetNotificationDTO) {
    const result = await this.notificationService.getNotifications(query);
    return new BaseResponse(
      result.data,
      HttpStatus.OK,
      'Get your notification successfully',
      result.pagination,
    );
  }
}
