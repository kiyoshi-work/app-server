import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from '@/database/entities';

export class UserRepository extends Repository<UserEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async getLastUserCreated(clientId: string) {
    return this.findOne({
      where: { client_id: clientId },
      order: { created_at: 'desc' },
    });
  }

  async findOneUserByClient(
    client_id: string,
    client_uid: string,
  ): Promise<UserEntity> {
    return this.createQueryBuilder('user')
      .where('user.client_id = :client_id', { client_id })
      .andWhere('user.client_uid = :client_uid', { client_uid })
      .limit(1)
      .getOne();
  }

  async findOneUserById(id: string): Promise<UserEntity> {
    return this.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .limit(1)
      .getOne();
  }
}
