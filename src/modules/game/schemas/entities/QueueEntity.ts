import { Schema, Context } from '@colyseus/schema';
const type = Context.create(); // this is your @type() decorator bound to a context
export class QueueEntity extends Schema {
  @type('string') id: string = '';
  constructor(id: string) {
    super();
    this.id = id;
  }
}
