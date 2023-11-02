import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ClientRepository,
  NotificationRepository,
  UserRepository,
} from '@/database/repositories';
import {
  GetNotificationDTO,
  PushNotificationAllDto,
  PushNotificationDto,
} from '../dtos/notification.dto';
import { chunk, getOffset } from '@/shared/utils';
import { MAX_EXTERNAL_IDS_SEND_NOTIFICATION } from '@/modules/onesignal/constant';
import { In } from 'typeorm';
import { Notification } from '@/onesignal/http/v1/notification';
import { UserNotificationRepository } from '@/modules/database/repositories/user-notification.repository';
import { ENotificationStatus } from '@/shared/constants/enums';
import { PAGINATION_TAKEN } from '@/shared/constants/constants';
import { UserNotificationEntity } from '@/modules/database/entities/user-notification.entity';
import { UserEntity } from '@/modules/database/entities';

@Injectable()
export class NotificationService {
  constructor(
    private readonly oneSignalNotification: Notification,
    private readonly userRepository: UserRepository,
    private readonly clientRepository: ClientRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
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
    const users = await this.userRepository.find({
      where: {
        client_id: body.client_id,
        client_uid: In(body.recipients),
      },
    });
    const receiveIdsChunked = chunk(
      users.map((user) => ({ id: user.id, external_id: user.client_uid })),
      MAX_EXTERNAL_IDS_SEND_NOTIFICATION,
    );
    const data = {
      title: body.title,
      launchUrl: body.launch_url,
      content: body.content,
    };
    let notification;
    if (body.is_logged_db) {
      notification = await this.notificationRepository.logToDatabase({
        ...data,
        type: body.type,
      });
    }
    let res = false;
    let error;
    for (const _receivers of receiveIdsChunked) {
      try {
        await this.oneSignalNotification.sendByExternalIds({
          ...data,
          externalIds: _receivers.map((_receiver) => _receiver.external_id),
          onesignalAppId: client?.onesignal_app_id,
          onesignalApiKey: client?.onesignal_api_key,
        });
        if (body.is_logged_db) {
          await this.userNotificationRepository.logToDatabase(
            _receivers.map((_receiver) => ({
              receiverId: _receiver.id,
              notificationId: notification?.id,
              status: ENotificationStatus.Sent,
            })),
          );
        }
        res = true;
      } catch (error) {
        error = error;
        console.log('send noti event error: ', _receivers, error);
      }
    }
    return { res, error };
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
      relations: ['notification', 'receiver'],
      order: { created_at: 'DESC' },
    });

    const notiHistoryIds = await this.userNotificationRepository.find({
      where: {
        receiver: {
          client_uid: query.recipient_id,
          client_id: query.client_id,
        },
        notification: {
          type: query?.type,
        },
        status: ENotificationStatus.Sent,
      },
      relations: ['notification', 'receiver'],
      select: ['id'],
    });
    await this.userNotificationRepository.update(
      {
        id: In(notiHistoryIds.map((noti) => noti.id)),
      },
      { status: ENotificationStatus.Read },
    );

    // await this.userNotificationRepository
    //   .createQueryBuilder('user-noti')
    //   .leftJoinAndMapOne(
    //     'user-noti.receiver',
    //     UserEntity,
    //     'receiver',
    //     'user-noti.receiver_id = receiver.id',
    //   )
    //   .where('receiver.client_id = :client_id', {
    //     client_id: query.client_id,
    //   })
    //   .andWhere('receiver.client_uid = :client_uid', {
    //     client_uid: query.recipient_id,
    //   })
    //   .update(UserNotificationEntity)
    //   .set({
    //     status: ENotificationStatus.Read,
    //   })
    //   .execute();
    return notiHistory;
    // .map((noti) => ({
    //   ...noti.notification,
    //   status: noti.status,
    // }));

    // this.eventManager.publish(
    //   new UserReadNotiEvent(userId, query.category, query.type),
    // );
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
        notification: {
          type: query?.type,
        },
        status: ENotificationStatus.Sent,
      })
      .getRawOne();
    return userNoti?.total_unread;
  }
}
