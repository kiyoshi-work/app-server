import { Module } from '@nestjs/common';
import { Notification } from './http/v1/notification';
import { User } from './http/v1/user';

@Module({
  providers: [User, Notification],
  exports: [User, Notification],
})
export class OnesignalModule {}
