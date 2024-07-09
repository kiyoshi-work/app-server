import {
  EMainRoomPhase,
  ERussianPistolRoomStatus,
} from '@/shared/constants/enums';
import { ArraySchema, Schema, type } from '@colyseus/schema';
import { QueueEntity } from '../entities/QueueEntity';

export class MainRoomState extends Schema {
  LOBBY_CHANNEL: string;
  //   @type('string') userId: string;
  //   @type('string') name: string;

  @type('string')
  id: string;

  @type([QueueEntity])
  queue = new ArraySchema<QueueEntity>();

  @type('string')
  phase = EMainRoomPhase.None;

  statusRoom: ERussianPistolRoomStatus = ERussianPistolRoomStatus.INITIALIZE;

  roomDbId: string;
}
