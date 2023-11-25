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
import { getOffset } from '@/shared/utils';
import { UserNotificationRepository } from '@/modules/database/repositories/user-notification.repository';
import { PAGINATION_TAKEN } from '@/shared/constants/constants';
import { EventManager } from '@/modules/event/event.manager';
import { SendNotiExternalEvent } from '@/modules/event/impls/sent-noti-external.event';

@Injectable()
export class NotificationService {
  @Inject(EventManager)
  private readonly eventManager: EventManager;

  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
  ) { }

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
    return notiHistory;
  }
}
