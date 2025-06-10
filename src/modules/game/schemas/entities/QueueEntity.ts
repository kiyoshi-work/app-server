import { Schema, type } from '@colyseus/schema';

export class QueueEntity extends Schema {
  @type('string') id: string = '';
  constructor(id: string) {
    super();
    this.id = id;
  }
}
