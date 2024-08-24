import { Command } from '@colyseus/command';
import { MainRoom } from '../rooms/main.room';
import { TActionRoom } from '@/shared/types';

type Payload = {
  data: TActionRoom;
  callback?: () => void;
};

export default class ExecuteActionCommand extends Command<MainRoom, Payload> {
  async execute(payload: Payload) {
    let { data } = payload;
  }
}
