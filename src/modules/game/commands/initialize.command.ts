import { Command } from '@colyseus/command';
import { ServerError } from 'colyseus';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { MainRoom } from '../rooms/main.room';
import { GameError } from '@/shared/constants/errors';

export type TOptionInitMapRoom = {
  roomId: string;
};
type Payload = {
  options?: TOptionInitMapRoom;
  callback?: (response: any) => void;
};

export default class InitializeCommand extends Command<MainRoom, Payload> {
  constructor() {
    super();
  }
  async execute(data: Payload) {
    const { callback } = data;

    //NOTE: Validate room info, load assets
    // check existed roomId
    // if (!data.options.roomId) {
    //   //TODO: build code error
    //   throw new ServerError(
    //     GameError.EmptyRoomId().code,
    //     GameError.EmptyRoomId().message,
    //   );
    // }
    // if (
    //   !uuidValidate(data.options.roomId) ||
    //   uuidVersion(data.options.roomId) !== 4
    // ) {
    //   //TODO: build code error
    //   throw new ServerError(
    //     GameError.IncorrectRoomIdType().code,
    //     GameError.IncorrectRoomIdType().message,
    //   );
    // }
    callback && callback({});
  }
}
