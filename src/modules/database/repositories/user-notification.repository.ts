import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserNotificationEntity } from '../entities/user-notification.entity';
import { ENotificationStatus } from '@/shared/constants/enums';

export interface IParamsUserNoti {
  receiverId: string;
  notificationId: string;
  status?: ENotificationStatus;
}

export class UserNotificationRepository extends Repository<UserNotificationEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(UserNotificationEntity, dataSource.createEntityManager());
  }

  async logToDatabase(data: IParamsUserNoti[]) {
    await this.save(
      data.map((dt) => ({
        receiver_id: dt.receiverId,
        notification_id: dt.notificationId,
        status: dt.status,
      })),
    );
  }
}
