import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '@/database';
import { EventManager } from './event.manager';
import { SendNotiExternalEventHandler } from './handlers/send-noti-external.event-handler';
import { OnesignalModule } from '../onesignal/onesignal.module';

export const EventHandlers = [SendNotiExternalEventHandler];

@Module({
  imports: [CqrsModule, DatabaseModule, OnesignalModule],
  controllers: [],
  providers: [...EventHandlers, EventManager],
  exports: [EventManager],
})
export class EventModule { }
