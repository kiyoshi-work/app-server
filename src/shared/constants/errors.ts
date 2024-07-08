export enum EGameError {
  // onCreate room
  EmptyRoomId = 'EmptyRoomId',
  ExpiredRoom = 'ExpiredRoom',
  IncorrectRoomIdType = 'IncorrectRoomIdType',

  // authorized room
  ExpiredToken = 'ExpiredToken',
  NotExistedUser = 'NotExistedUser',

  // room message
  Time = 'Time',

  // game started
  GameStarted = 'GameStarted',
}

type TErrorParser = {
  [errorName in EGameError]: (...args: any[]) => TError;
};
export type TError = {
  code: number;
  message: string;
};

export const GameError: TErrorParser = {
  // verified room code
  EmptyRoomId: () => ({
    code: 1001,
    message: 'The roomId should be not empty',
  }),
  IncorrectRoomIdType: () => ({
    code: 1002,
    message: 'The roomId should be uuid',
  }),
  ExpiredRoom: (roomId: string) => ({
    code: 1004,
    message: `The roomId ${roomId} has expired`,
  }),
  ExpiredToken: () => ({
    code: 1007,
    message: 'Unauthorize, Token has expired!',
  }),
  NotExistedUser: () => ({
    code: 1009,
    message: 'Unauthorized! The user does not exist in database',
  }),
  // room
  Time: (phase: string, nextPhase: string) => ({
    code: 2001,
    message: `Server is in ${phase} phase, not allow to ${nextPhase} now`,
  }),
  // error game already started
  GameStarted: () => ({
    code: 2002,
    message: 'Game has already started',
  }),
};
