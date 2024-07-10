import { Command } from '@colyseus/command';
import { MainRoom } from '../rooms/main.room';

type Payload = {
  callback?: () => void;
};

export default class EndGameCommand extends Command<MainRoom> {
  async execute(data: Payload) {
    let { roomDbId } = this.room.state;

    if (data.callback) {
      data.callback();
    }
  }
}
