import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientRepository, SegmentRepository } from '@/database/repositories';
import {
  GetNotificationDTO,
  PushNotificationAllDto,
  PushNotificationDto,
  PushNotificationSegmentDto,
} from '../dtos/notification.dto';
import { getOffset } from '@/shared/utils';
import { Notification } from '@/onesignal/http/v1/notification';
import { UserNotificationRepository } from '@/modules/database/repositories/user-notification.repository';
import { ENotificationStatus } from '@/shared/constants/enums';
import { PAGINATION_TAKEN } from '@/shared/constants/constants';
import { EventManager } from '@/modules/event/event.manager';
import { UserReadNotiEvent } from '@/modules/event/impls/user-read-noti.event';
import { SendNotiExternalEvent } from '@/modules/event/impls/sent-noti-external.event';
import { SendNotiBySegmentEvent } from '@/modules/event/impls/sent-noti-by-segment.event';
import { SendNotiAllEvent } from '@/modules/event/impls/sent-noti-all.event';

@Injectable()
export class NotificationService {
  @Inject(EventManager)
  private readonly eventManager: EventManager;

  constructor(
    private readonly oneSignalNotification: Notification,
    private readonly clientRepository: ClientRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
    private readonly segmentRepository: SegmentRepository,
  ) {}

  async pushNotificationAll(body: PushNotificationAllDto) {
    const client = await this.clientRepository.findOneBy({
      id: body.client_id,
    });
    if (!(client?.onesignal_app_id && client?.onesignal_api_key)) {
      throw new InternalServerErrorException(
        'Not found client or onesignal key',
      );
    }
    let res = false;
    let error;
    try {
      const data = {
        title: body.title,
        launchUrl: body.launch_url,
        content: body.content,
      };
      await this.oneSignalNotification.sendToAll({
        ...data,
        onesignalAppId: client?.onesignal_app_id,
        onesignalApiKey: client?.onesignal_api_key,
      });
      this.eventManager.publish(
        new SendNotiAllEvent(
          client.onesignal_app_id,
          client.onesignal_api_key,
          body.client_id,
          body.title,
          body.content,
          body.launch_url,
          body.content_html,
          body.is_logged_db,
          body.type,
        ),
      );
      res = true;
    } catch (error) {
      error = error;
    }
    return { res, error };
  }
  async pushNotification(body: PushNotificationDto) {
    const client = await this.clientRepository.findOneBy({
      id: body.client_id,
    });
    if (!(client?.onesignal_app_id && client?.onesignal_api_key)) {
      throw new InternalServerErrorException(
        'Not found client or onesignal key',
      );
    }
    this.eventManager.publish(
      new SendNotiExternalEvent(
        client.onesignal_app_id,
        client.onesignal_api_key,
        body.client_id,
        body.recipients,
        body.title,
        body.content,
        body.launch_url,
        body.content_html,
        body.is_logged_db,
        body.type,
      ),
    );
    return true;
  }

  async pushNotificationSegment(body: PushNotificationSegmentDto) {
    const segment = await this.segmentRepository.findSegmentByClient(
      body.client_id,
      body.segment_cid,
    );
    if (!segment) {
      throw new BadRequestException('Not found segment');
    }
    if (
      !(segment?.client?.onesignal_app_id && segment?.client?.onesignal_api_key)
    ) {
      throw new InternalServerErrorException(
        'Not found client or onesignal key',
      );
    }
    this.eventManager.publish(
      new SendNotiBySegmentEvent(
        segment?.client?.onesignal_app_id,
        segment?.client?.onesignal_api_key,
        segment?.id,
        body.title,
        body.content,
        body.launch_url,
        body.content_html,
        body.is_logged_db,
        body.type,
      ),
    );
    return true;
  }

  async getNotifications(query: GetNotificationDTO) {
    const take = query?.take || PAGINATION_TAKEN;
    const notiHistory = await this.userNotificationRepository.find({
      where: {
        receiver: {
          client_uid: query.recipient_id,
          client_id: query.client_id,
        },
        notification: {
          type: query?.type,
        },
      },
      take: take,
      skip: getOffset(take, query?.page || 0),
      relations: ['notification'],
      order: { created_at: 'DESC' },
    });
    this.eventManager.publish(
      new UserReadNotiEvent(query.recipient_id, query.client_id, query.type),
    );
    return notiHistory;
  }

  async clickNoti(user_notification_id: string) {
    await this.userNotificationRepository.update(
      { id: user_notification_id },
      { status: ENotificationStatus.Clicked },
    );
  }

  async countNotificationUnread(query: GetNotificationDTO) {
    const userNoti = await this.userNotificationRepository
      .createQueryBuilder('user-noti')
      .leftJoin('user-noti.notification', 'notification')
      .leftJoin('user-noti.receiver', 'receiver')
      .select(['CAST(COUNT(*) AS int) as total_unread'])
      .where({
        receiver: {
          client_uid: query.recipient_id,
          client_id: query.client_id,
        },
        ...(query?.type && {
          notification: {
            type: query?.type,
          },
        }),
        status: ENotificationStatus.Sent,
      })
      .getRawOne();
    return userNoti?.total_unread;
  }
}
