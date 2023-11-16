import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserNotificationRepository } from '@/modules/database/repositories/user-notification.repository';
import { ENotificationStatus } from '@/shared/constants/enums';
import { Notification } from '@/onesignal/http/v1/notification';
import { chunk } from '@/shared/utils';
import { MAX_BATCH_INSERT } from '@/modules/onesignal/constant';
import {
  NotificationRepository,
  UserRepository,
} from '@/modules/database/repositories';
import { SendNotiAllEvent } from '../impls/sent-noti-all.event';

@EventsHandler(SendNotiAllEvent)
export class SendNotiAllEventHandler
  implements IEventHandler<SendNotiAllEvent>
{
  @Inject(UserNotificationRepository)
  private readonly userNotificationRepository: UserNotificationRepository;

  @Inject(UserRepository)
  private readonly userRepository: UserRepository;

  @Inject(NotificationRepository)
  private readonly notificationRepository: NotificationRepository;

  @Inject(Notification)
  private readonly oneSignalNotification: Notification;

  async handle(event: SendNotiAllEvent) {
    const users = await this.userRepository.find({
      where: {
        client_id: event.client_id,
      },
      select: ['id'],
    });
    const receiveIdsChunked = chunk(
      users.map((user) => ({ id: user.id })),
      MAX_BATCH_INSERT,
    );
    const data = {
      title: event.title,
      launchUrl: event.launch_url,
      content: event.content,
      content_html: event.content_html ? event.content_html : event.content,
    };
    await this.oneSignalNotification.sendToAll({
      ...data,
      onesignalAppId: event?.onesignalAppId,
      onesignalApiKey: event?.onesignalApiKey,
    });

    let notification;
    if (event.is_logged_db) {
      notification = await this.notificationRepository.logToDatabase({
        ...data,
        type: event.type,
      });
      for (const _receivers of receiveIdsChunked) {
        try {
          await this.userNotificationRepository.logToDatabase(
            _receivers.map((_receiver) => ({
              receiverId: _receiver.id,
              notificationId: notification?.id,
              status: ENotificationStatus.Sent,
            })),
          );
        } catch (error) {
          console.log('send noti all error: ', _receivers, error);
        }
      }
    }
  }
}
