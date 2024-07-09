import getDecorators from 'inversify-inject-decorators';
import { Container } from 'inversify';
import { UserRepository } from '@/database/repositories';
import { DataSource } from 'typeorm';
import { REPOSITORIES } from './symbols';

const container = new Container({
  defaultScope: 'Singleton',
  //   skipBaseClassChecks: true,
});

(async () => {
  const appDataSource = await new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'test',
    entities: ['dist/**/*.entity{.ts,.js}'],
    logging: false,
  }).initialize();
  container
    .bind(REPOSITORIES.UserRepository)
    .toDynamicValue(() => new UserRepository(appDataSource));
})();

// container.bind<DataSource>(DataSource).toSelf();
const { lazyInject } = getDecorators(container);
export { lazyInject };
export default container;
