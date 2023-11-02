import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { NotificationEntity } from '../entities/notification.entity';

export interface IParamsNoti {
  title?: string;
  content?: string;
  content_html?: string;
  launchUrl?: string;
  type?: string;
}

export class NotificationRepository extends Repository<NotificationEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(NotificationEntity, dataSource.createEntityManager());
  }

  async logToDatabase(data: IParamsNoti) {
    return this.save({
      content: data.content,
      title: data.title,
      launch_url: data.launchUrl,
      content_html: data.content_html,
      type: data.type,
    });
  }
}
