import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserNotificationRepository } from '@/modules/database/repositories/user-notification.repository';
import { ENotificationStatus, ESegmentStatus } from '@/shared/constants/enums';
import { Notification } from '@/onesignal/http/v1/notification';
import { chunk } from '@/shared/utils';
import { MAX_EXTERNAL_IDS_SEND_NOTIFICATION } from '@/modules/onesignal/constant';
import {
  NotificationRepository,
  UserSegmentRepository,
} from '@/modules/database/repositories';
import { SendNotiBySegmentEvent } from '../impls/sent-noti-by-segment.event';

@EventsHandler(SendNotiBySegmentEvent)
export class SendNotiBySegmentEventHandler
  implements IEventHandler<SendNotiBySegmentEvent>
{
  @Inject(UserNotificationRepository)
  private readonly userNotificationRepository: UserNotificationRepository;

  @Inject(UserSegmentRepository)
  private readonly userSegmentRepository: UserSegmentRepository;

  @Inject(NotificationRepository)
  private readonly notificationRepository: NotificationRepository;

  @Inject(Notification)
  private readonly oneSignalNotification: Notification;

  async handle(event: SendNotiBySegmentEvent) {
    const users = await this.userSegmentRepository.find({
      where: {
        segment_id: event.segment_id,
        status: ESegmentStatus.Active,
      },
      relations: ['user'],
      select: ['user'],
    });
    const receiveIdsChunked = chunk(
      users.map((user) => ({
        id: user?.user?.id,
        external_id: user?.user?.client_uid,
      })),
      MAX_EXTERNAL_IDS_SEND_NOTIFICATION,
    );
    const data = {
      title: event.title,
      launchUrl: event.launch_url,
      content: event.content,
      content_html: event.content_html ? event.content_html : event.content,
    };
    let notification;
    if (event.is_logged_db) {
      notification = await this.notificationRepository.logToDatabase({
        ...data,
        type: event.type,
      });
    }
    for (const _receivers of receiveIdsChunked) {
      try {
        await this.oneSignalNotification.sendByExternalIds({
          ...data,
          externalIds: _receivers.map((_receiver) => _receiver.external_id),
          onesignalAppId: event?.onesignalAppId,
          onesignalApiKey: event?.onesignalApiKey,
        });
        if (event?.is_logged_db) {
          await this.userNotificationRepository.logToDatabase(
            _receivers.map((_receiver) => ({
              receiverId: _receiver.id,
              notificationId: notification?.id,
              status: ENotificationStatus.Sent,
            })),
          );
        }
      } catch (error) {
        console.log('send noti by segment error: ', error);
      }
    }
  }
}
