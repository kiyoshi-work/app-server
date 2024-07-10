import { Injectable, Scope } from '@nestjs/common';
import { MainRoomState } from '@/game/schemas/states/MainRoomState';
import { BattleLogRepository } from '@/modules/database/repositories';
import { REPOSITORIES } from '@/shared/injection/symbols';
import { lazyInject } from '@/shared/injection/container';

export enum ERussianPistolRoomLogType {
  CLIENT_TO_SERVER = 'CLIENT_TO_SERVER',
  SERVER_TO_CLIENT = 'SERVER_TO_CLIENT',
  INNER_SERVER = 'INNER_SERVER',
  CLIENT_ERROR = 'CLIENT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}
@Injectable({ scope: Scope.TRANSIENT })
export class GameLogger {
  @lazyInject(REPOSITORIES.BattleLogRepository)
  private battleLogRepository: BattleLogRepository;
  public constructor() {}
  public error(
    roomId: string,
    data: any,
    type: ERussianPistolRoomLogType = ERussianPistolRoomLogType.SERVER_ERROR,
    state?: MainRoomState,
    phase?: string,
  ) {
    try {
      if (roomId) {
        let log = {
          room_id: roomId,
          type: type,
          data: data,
          state: {},
          phase: phase,
        };
        if (typeof data === 'string') {
          log = { ...log, data: { message: data } };
        }
        if (state) {
          log = { ...log, state: state, phase: state.phase };
        }
        this.battleLogRepository
          .insert(log)
          .then(() => {})
          .catch((error: string) => {
            console.log(`insert database log ${error}`);
          });
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  public info(
    roomId: string,
    data: any,
    type: ERussianPistolRoomLogType,
    state?: MainRoomState,
    phase?: string,
  ) {
    try {
      if (roomId) {
        let log = {
          room_id: roomId,
          type: type,
          data: data,
          state: {},
          phase: phase,
        };
        if (typeof data === 'string') {
          log = { ...log, data: { message: data } };
        }
        if (state) {
          log = { ...log, state: state, phase: state.phase };
        }
        this.battleLogRepository
          .insert(log)
          .then(() => {})
          .catch((error: string) => {
            console.log(`insert database log ${error}`);
          });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
