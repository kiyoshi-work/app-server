import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientRepository } from '@/database/repositories';
import {
  GetNotificationDTO,
  PushNotificationDto,
} from '../dtos/notification.dto';
import { UserNotificationRepository } from '@/modules/database/repositories/user-notification.repository';
import { EventManager } from '@/modules/event/event.manager';
import { SendNotiExternalEvent } from '@/modules/event/impls/sent-noti-external.event';
import { paginate } from '@/shared/pagination/pagination';

@Injectable()
export class NotificationService {
  @Inject(EventManager)
  private readonly eventManager: EventManager;

  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

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

  async getNotifications(query: GetNotificationDTO) {
    const notiHistoryQuery = this.userNotificationRepository
      .createQueryBuilder('user-noti')
      .leftJoinAndSelect('user-noti.notification', 'notification')
      .leftJoinAndSelect('user-noti.receiver', 'receiver')
      .where({
        receiver: {
          client_uid: query.recipient_id,
          client_id: query.client_id,
        },
        notification: {
          type: query?.type,
        },
      })
      .orderBy('user-noti.created_at', 'DESC');
    return paginate(notiHistoryQuery, query.page, query.take);
  }
}
