import 'reflect-metadata';
import { Room, Client } from 'colyseus.js';
import { randomSecond } from './helpers';
import path from 'path';
if (!process.env.APP_ENV) {
  require('dotenv').config({
    path: path.resolve(__dirname, '../../.env'),
  });
}

export enum EMainRoomPhase {
  None = 'None',
  StartGame = 'StartGame',
  StartTurn = 'StartTurn',
  StartAction = 'StartAction',
  ExecuteAction = 'ExecuteAction',
  EndTurn = 'EndTurn',
  EndGame = 'EndGame',
  Left = 'Left',
  Error = 'Error',
  Reconnect = 'Reconnect',
}

export enum EMessageMainRoom {
  DoneStartTurnAnimation = 'DoneStartTurnAnimation',
  DoneStartGameAnimation = 'DoneStartGameAnimation',
  UserAction = 'UserAction',
  DoneActionAnimation = 'DoneActionAnimation',
}

export async function requestJoinOptions(
  this: Client,
  i: number,
  data: { areaName?: string; level?: number; token?: string },
) {
  try {
    return {
      //   access_token: access_token,
      //   roomId: result.data.data.id,
    };
  } catch (error) {
    console.log(error);
  }
}

const MaxWaitingTime = {
  StartGameAnimation: 1,
  StartTurnAnimation: 2,
  UserAction: 1,
  ExecuteActionAnimation: 1,
};

export async function onJoin(this: Room) {
  console.log(this.id, 'roomId');
  console.log(this.sessionId, 'joined.');
  const startTime: number = Date.now();

  const sendMessage = async (
    type: EMessageMainRoom,
    data: any,
    time: number,
  ) => {
    console.log(`=== Start sending ${type} ===`);
    await new Promise((resolve) => {
      setTimeout(resolve, time);
    });
    this.send(type, data);
    console.log(
      `=== Sent ${type} in ${time} ms with data: ${JSON.stringify(data)} ===`,
    );
  };
  const processEndGame = (message: any) => {
    console.log(
      `================== END GAME: ${message.matchResult} ==================`,
    );
    console.timeLog(
      `${this.sessionId} play in : ${
        (Date.now() - startTime) / 1000
      } s and ${message} `,
    );
    process.exit();
  };

  const processStartGame = async (message: any) => {
    console.log(`================== START GAME ${message} ==================`);
    await sendMessage(
      EMessageMainRoom.DoneStartGameAnimation,
      {},
      1000 * randomSecond(MaxWaitingTime.StartGameAnimation),
    );
  };

  const processStartTurn = async (message: any) => {
    console.log(`================== START TURN ${message} ==================`);
    await sendMessage(
      EMessageMainRoom.DoneStartTurnAnimation,
      {},
      1000 * randomSecond(MaxWaitingTime.StartTurnAnimation),
    );
  };

  const processStartAction = async (message: any) => {
    console.log(
      `================== USER ACTION ${JSON.stringify(message)} ==================`,
    );
    await sendMessage(
      EMessageMainRoom.UserAction,
      { actionType: message?.isJustSurvived == true ? 'PASS' : 'PULL' },
      1000 * randomSecond(MaxWaitingTime.UserAction),
    );
  };

  const processExecuteAction = async (message: any) => {
    console.log(
      `================== ExecuteActionAnimation ${message} ==================`,
    );
    await sendMessage(
      EMessageMainRoom.DoneStartTurnAnimation,
      {},
      1000 * randomSecond(MaxWaitingTime.ExecuteActionAnimation),
    );
  };

  this.onMessage('*', async (type, message) => {
    try {
      switch (type) {
        case EMainRoomPhase.StartGame:
          await processStartGame(message);
          break;
        case EMainRoomPhase.StartTurn:
          await processStartTurn(message);
          break;
        case EMainRoomPhase.StartAction:
          await processStartAction(message);
          break;

        case EMainRoomPhase.ExecuteAction:
          await processExecuteAction(message);
          break;
        case EMainRoomPhase.EndGame:
          processEndGame(message);
        case 'Error':
          if (Math.floor(message.code / 1000) === 4) {
            console.warn('WARNING: ', message);
          } else {
            console.error('ERROR: ', message);
          }
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(e);
    }
  });
}

export function onLeave(this: Room) {
  console.log(this.sessionId, 'left.');
}

export function onError(this: Room, err: any) {
  console.error(this.sessionId, '!! ERROR !!', err.message);
}

export function onStateChange(this: Room, _state: any) {
  //   console.log("🚀 ~ file: loadtest.ts ~ line 514 ~ onStateChange ~ this", _state.phase, _state.currentTurn, _state.nekos.forEach((ne: any) => console.log(
  //     "NEKO: ---",
  //     ne.id,
  //     " : ",
  //     JSON.stringify({
  //       currMetadata: ne.currMetadata,
  //       metadata: ne.metadata,
  //       initMetadata: ne.initMetadata,
  //     }),
  //     ` : isSleeping: ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Sleep)
  //     )} -- isForbidden: ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Stun)
  //     )} -- isSilent: ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Silent)
  //     )} -- isTaunted:  ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Taunt)
  //     )} -- isFrozen: ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Frozen)
  //     )} -- isConfused: ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Confuse)
  //     )}`
  //   )));
  //   console.log("🚀 ~ file: loadtest.ts ~ line 537 ~ onStateChange ~ this", _state.phase, _state.currentTurn, _state.enemies.forEach((ne: any) => console.log(
  //     "ENEMY: ---",
  //     ne.id,
  //     " : ",
  //     JSON.stringify({
  //       currMetadata: ne.currMetadata,
  //       metadata: ne.metadata,
  //       initMetadata: ne.initMetadata,
  //     }),
  //     ` : isSleeping: ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Sleep)
  //     )} -- isForbidden: ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Stun)
  //     )} -- isSilent: ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Silent)
  //     )} -- isTaunted:  ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Taunt)
  //     )} -- isFrozen: ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Frozen)
  //     )} -- isConfused: ${JSON.stringify(
  //       ne.effects.get(EEffectStatus.Confuse)
  //     )}`
  //   )))
}
