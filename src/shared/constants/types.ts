import { EMainRoomPhase } from './enums';

export type TJWTPayload = {
  sub: string;
  address?: string;
};

export type TMessage<T> = {
  type: EMainRoomPhase;
  data: T;
};

export enum EActionType {
  PULL = 'PULL',
  PASS = 'PASS',
}
export type TActionRoom = {
  actionType: EActionType;
};
