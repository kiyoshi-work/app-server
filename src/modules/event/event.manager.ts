import { Inject, Injectable } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';

@Injectable()
export class EventManager {
  @Inject(EventBus)
  private eventBus: EventBus;

  publish(event: IEvent) {
    this.eventBus.publish(event);
  }
}
