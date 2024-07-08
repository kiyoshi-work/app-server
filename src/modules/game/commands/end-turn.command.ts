import { Command } from '@colyseus/command';
import { MainRoom } from '../rooms/main.room';

export default class EndTurnCommand extends Command<MainRoom> {
  async execute() {
    let { roomDbId } = this.room.state;
  }
}
