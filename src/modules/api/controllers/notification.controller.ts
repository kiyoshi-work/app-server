import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  GetNotificationDTO,
  PushNotificationAllDto,
  PushNotificationDto,
} from '../dtos/notification.dto';
import { NotificationService } from '../services/notification.service';

@ApiTags('Notification')
@Controller('/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async pushNotification(@Body() body: PushNotificationDto) {
    const { res, error } =
      await this.notificationService.pushNotification(body);
    return {
      statusCode: HttpStatus.OK,
      data: res,
      ...(res && { message: error }),
    };
  }

  @Post('/all')
  async pushNotificationAll(@Body() body: PushNotificationAllDto) {
    const { res, error } =
      await this.notificationService.pushNotificationAll(body);
    return {
      statusCode: HttpStatus.OK,
      data: res,
      ...(res && { message: error }),
    };
  }

  @Get()
  async getNotification(@Query() query: GetNotificationDTO) {
    const result = await this.notificationService.getNotifications(query);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Get('/unread-count')
  async countNotificationUnread(@Query() query: GetNotificationDTO) {
    const result =
      await this.notificationService.countNotificationUnread(query);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Put('/:user_notification_id/click')
  async clickNoti(
    @Param('user_notification_id', ParseUUIDPipe)
    user_notification_id: string,
  ) {
    await this.notificationService.clickNoti(user_notification_id);
    return {
      statusCode: HttpStatus.OK,
      data: true,
    };
  }
}
