import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserNotificationRepository } from '@/modules/database/repositories/user-notification.repository';
import { ENotificationStatus } from '@/shared/constants/enums';
import { Notification } from '@/onesignal/http/v1/notification';
import {
  NotificationRepository,
  UserRepository,
} from '@/modules/database/repositories';
import { SendNotiAllEvent } from '../impls/sent-noti-all.event';
import { User } from '@/modules/onesignal/http/v1/user';
import { In } from 'typeorm';
import { chunk } from '@/shared/utils';
import { MAX_EXTERNAL_IDS_SEND_NOTIFICATION } from '@/modules/onesignal/constant';

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

  @Inject(User)
  private readonly oneSignalUser: User;

  async handle(event: SendNotiAllEvent) {
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

    if (event.is_logged_db) {
      const notification = await this.notificationRepository.logToDatabase({
        ...data,
        type: event.type,
      });
      const externalIds: any = await this.oneSignalUser.getAllExternalIds({
        appId: event?.onesignalAppId,
        apiKey: event?.onesignalApiKey,
        limit: 200,
      });
      const externalIdsChunked = chunk(
        externalIds,
        MAX_EXTERNAL_IDS_SEND_NOTIFICATION,
      );
      for (const _externalIds of externalIdsChunked) {
        const users = await this.userRepository.find({
          where: {
            client_id: event.client_id,
            client_uid: In(_externalIds),
          },
          select: ['id'],
        });
        try {
          await this.userNotificationRepository.logToDatabase(
            users.map((_receiver) => ({
              receiverId: _receiver.id,
              notificationId: notification?.id,
              status: ENotificationStatus.Sent,
            })),
          );
        } catch (error) {
          console.log('save noti all error: ', error);
        }
      }

      // let _currCount = 0;
      // const _currOffset = 0;
      // while (true) {
      //   const response: any = await this.oneSignalUser.listUsers({
      //     appId: event?.onesignalAppId,
      //     apiKey: event?.onesignalApiKey,
      //     limit: 200,
      //     offset: _currOffset,
      //   });
      //   const _tmpUser = new Set();
      //   (response.players || []).map((player) =>
      //     _tmpUser.add(player.external_user_id),
      //   );
      //   const users = await this.userRepository.find({
      //     where: {
      //       client_id: event.client_id,
      //       client_uid: In([..._tmpUser]),
      //     },
      //     select: ['id'],
      //   });
      //   try {
      //     await this.userNotificationRepository.logToDatabase(
      //       users.map((_receiver) => ({
      //         receiverId: _receiver.id,
      //         notificationId: notification?.id,
      //         status: ENotificationStatus.Sent,
      //       })),
      //     );
      //   } catch (error) {
      //     console.log('send noti all error: ', error);
      //   }
      //   _currCount += Number(response.limit);
      //   if (_currCount >= Number(response.total_count || 0)) {
      //     break;
      //   }
      // }
    }
  }
}
