import { EMainRoomPhase } from './constants/enums';

export type TJWTPayload = {
  sub: string;
  address?: string;
};

export type TDevice = {
  user_agent: string;
  ip: string;
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
