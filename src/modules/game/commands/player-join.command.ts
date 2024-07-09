import { Command } from '@colyseus/command';
import { MainRoom } from '../rooms/main.room';
import { QueueEntity } from '../schemas/entities/QueueEntity';
import { Client } from 'colyseus';

type Payload = {
  client: Client;
};

export default class PlayerJoinCommand extends Command<MainRoom> {
  async execute(data: Payload) {
    let { roomDbId } = this.room.state;
    // TODO: check verify user room, add to queue

    this.state.queue.push(new QueueEntity(data.client.sessionId));

    if (this.state.queue.length == this.room.maxClients) {
      this.room.startGame();
    }
  }
}
