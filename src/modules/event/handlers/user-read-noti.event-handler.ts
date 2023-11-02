import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { In } from 'typeorm';
import { UserReadNotiEvent } from '@/event/impls/user-read-noti.event';
import { UserNotificationRepository } from '@/modules/database/repositories/user-notification.repository';
import { ENotificationStatus } from '@/shared/constants/enums';

@EventsHandler(UserReadNotiEvent)
export class UserReadNotiEventHandler
  implements IEventHandler<UserReadNotiEvent>
{
  @Inject(UserNotificationRepository)
  private readonly userNotificationRepository: UserNotificationRepository;

  async handle(event: UserReadNotiEvent) {
    const notiHistoryIds = await this.userNotificationRepository.find({
      where: {
        receiver: {
          client_uid: event.client_uid,
          client_id: event.client_id,
        },
        notification: {
          type: event?.type,
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
  }
}
