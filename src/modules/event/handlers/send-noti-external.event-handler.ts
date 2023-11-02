import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { In } from 'typeorm';
import { UserNotificationRepository } from '@/modules/database/repositories/user-notification.repository';
import { ENotificationStatus } from '@/shared/constants/enums';
import { SendNotiExternalEvent } from '../impls/sent-noti-external.event';
import { Notification } from '@/onesignal/http/v1/notification';
import { chunk } from '@/shared/utils';
import { MAX_EXTERNAL_IDS_SEND_NOTIFICATION } from '@/modules/onesignal/constant';
import {
  NotificationRepository,
  UserRepository,
} from '@/modules/database/repositories';

@EventsHandler(SendNotiExternalEvent)
export class SendNotiExternalEventHandler
  implements IEventHandler<SendNotiExternalEvent>
{
  @Inject(UserNotificationRepository)
  private readonly userNotificationRepository: UserNotificationRepository;

  @Inject(UserRepository)
  private readonly userRepository: UserRepository;

  @Inject(NotificationRepository)
  private readonly notificationRepository: NotificationRepository;

  @Inject(Notification)
  private readonly oneSignalNotification: Notification;

  async handle(event: SendNotiExternalEvent) {
    const users = await this.userRepository.find({
      where: {
        client_id: event.client_id,
        client_uid: In(event.recipients),
      },
    });
    const receiveIdsChunked = chunk(
      users.map((user) => ({ id: user.id, external_id: user.client_uid })),
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
    // let res = false;
    // let error;
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
        // res = true;
      } catch (error) {
        // error = error;
        console.log('send noti event error: ', _receivers, error);
      }
    }
  }
}
