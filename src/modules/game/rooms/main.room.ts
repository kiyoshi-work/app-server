import { Client, Room, Delayed } from 'colyseus';
import { MainRoomState } from '../schemas/states/MainRoomState';
import {
  ERoomDefine,
  EMainRoomPhase,
  EMessageMainRoom,
  ERussianPistolRoomStatus,
} from '@/shared/constants/enums';
import { Dispatcher } from '@colyseus/command';
import {
  ERussianPistolRoomLogType,
  GameLogger,
} from '@/logger/services/game.logger';
import { Injectable } from '@nestjs/common';
import InitializeCommand from '../commands/initialize.command';
import PlayerJoinCommand from '../commands/player-join.command';
import { TIME_CONFIG } from '@/shared/constants/game';
import { GameError, TError } from '@/shared/constants/errors';
import StartTurnCommand from '../commands/start-turn.command';
import ExecuteActionCommand from '../commands/execute-action.command';
import EndTurnCommand from '../commands/end-turn.command';
import { lazyInject } from '@/shared/injection/container';
import { UserRepository } from '@/database/repositories';
import { REPOSITORIES } from '@/shared/injection/symbols';
import { EActionType, TActionRoom, TMessage } from '@/shared/constants/types';
import EndGameCommand from '../commands/end-game.command';

@Injectable()
export class MainRoom extends Room<MainRoomState> {
  LOBBY_CHANNEL = ERoomDefine.MAIN_ROOM;
  maxClients = 6;
  public dispatcher = new Dispatcher(this);
  private gameLogger = new GameLogger();

  @lazyInject(REPOSITORIES.UserRepository)
  private userRepository: UserRepository;

  delayStartGame: Delayed;
  delayStartTurn: Delayed;
  delayStartAction: Delayed;
  delayExecuteAction: Delayed;
  delayEndTurn: Delayed;
  constructor() {
    super();
  }

  broadcastMessage<T>(message: TMessage<T>) {
    this.broadcast(message.type, message.data);
    this.gameLogger.info(
      this.state.roomDbId,
      message.data,
      ERussianPistolRoomLogType.SERVER_TO_CLIENT,
      this.state,
    );
  }

  broadcastError(data: TError) {
    this.broadcast(EMainRoomPhase.Error, data);
    this.gameLogger.error(
      this.state.roomDbId,
      data,
      ERussianPistolRoomLogType.CLIENT_ERROR,
    );
  }

  startGame = async () => {
    console.log('Start Game');
    this.lock();
    this.state.statusRoom = ERussianPistolRoomStatus.PLAYING;

    //NOTE: Assign Flag & clear timeout
    this.state.phase = EMainRoomPhase.StartGame;
    if (this.delayStartGame) {
      this.delayStartGame.clear();
    }

    // NOTE: Broadcast to client (OPTIONAL)
    this.broadcastMessage<any>({
      type: this.state.phase,
      data: {},
    });

    // NOTE: Delay next step
    this.delayStartTurn = this.clock.setTimeout(async () => {
      //NOTE: Locked
      if (this.state.phase === EMainRoomPhase.StartGame) {
        await this.startTurn();
      } else {
        this.broadcastError(
          GameError.Time(this.state.phase, EMainRoomPhase.StartTurn),
        );
      }
    }, TIME_CONFIG.WAITING_FOR_DONE_START_GAME_ANIMATION);
  };
  async startTurn() {
    console.log('Start Turn');

    //NOTE: Assign Flag & clear timeout
    this.state.phase = EMainRoomPhase.StartTurn;
    if (this.delayStartTurn) {
      this.delayStartTurn.clear();
    }

    //NOTE: Dispatch command & broadcast to client
    await this.dispatcher.dispatch(new StartTurnCommand(), {
      callback: (response) => {
        this.broadcastMessage<any>({
          type: this.state.phase,
          data: {},
        });
      },
    });

    //NOTE: Delay next step
    this.delayStartAction = this.clock.setTimeout(async () => {
      //NOTE: Locked
      if (this.state.phase === EMainRoomPhase.StartTurn) {
        await this.startAction();
      } else {
        this.broadcastError(
          GameError.Time(this.state.phase, EMainRoomPhase.StartAction),
        );
      }
    }, TIME_CONFIG.WAITING_FOR_DONE_START_TURN_ANIMATION);
  }

  private startAction = async () => {
    //NOTE: Assign Flag & clear timeout
    this.state.phase = EMainRoomPhase.StartAction;
    if (this.delayStartAction) {
      this.delayStartAction.clear();
    }

    //NOTE: Delay next step
    this.delayExecuteAction = this.clock.setTimeout(async () => {
      //NOTE: Locked
      if (this.state.phase === EMainRoomPhase.StartAction) {
        await this.defaultAction();
      } else {
        this.broadcastError(
          GameError.Time(this.state.phase, EMainRoomPhase.ExecuteAction),
        );
      }
    }, TIME_CONFIG.WAITING_FOR_USER_ACTION);
  };

  private defaultAction = async () => {
    await this.executeAction({ actionType: EActionType.PULL });
  };

  private executeAction = async (action: TActionRoom) => {
    //NOTE: Assign Flag & clear timeout
    this.state.phase = EMainRoomPhase.ExecuteAction;
    if (this.delayExecuteAction) {
      this.delayExecuteAction.clear();
    }
    //NOTE: Dispatch command & broadcast to client
    await this.dispatcher.dispatch(new ExecuteActionCommand(), {
      data: action,
      callback: () => {
        this.broadcastMessage<any>({
          type: this.state.phase,
          data: {},
        });
      },
    });
    //NOTE: Delay next step
    this.delayEndTurn = this.clock.setTimeout(async () => {
      //NOTE: Locked
      if (this.state.phase === EMainRoomPhase.ExecuteAction) {
        await this.endTurn();
      } else {
        this.broadcastError(
          GameError.Time(this.state.phase, EMainRoomPhase.EndTurn),
        );
      }
    }, TIME_CONFIG.WAITING_FOR_DONE_EXECUTE_ACTION_ANIMATION);
  };

  private endTurn = async () => {
    this.state.phase = EMainRoomPhase.EndTurn;
    if (this.delayEndTurn) {
      this.delayEndTurn.clear();
    }
    await this.dispatcher.dispatch(new EndTurnCommand(), {
      callback: () => {
        this.broadcastMessage<any>({
          type: this.state.phase,
          data: {},
        });
      },
    });
    const checkEndGame = Math.floor(Math.random() * 5) === 0;
    if (checkEndGame) {
      await this.endGame();
    } else {
      this.delayStartTurn = this.clock.setTimeout(async () => {
        //NOTE: Locked
        if (this.state.phase === EMainRoomPhase.EndTurn) {
          await this.startTurn();
        } else {
          this.broadcastError(
            GameError.Time(this.state.phase, EMainRoomPhase.StartTurn),
          );
        }
      }, TIME_CONFIG.WAITING_FOR_DONE_END_TURN_ANIMATION);
    }
  };

  private endGame = async () => {
    this.state.phase = EMainRoomPhase.EndGame;
    await this.dispatcher.dispatch(new EndGameCommand(), {
      callback: (matchResult: any) => {
        //NOTE: Broadcast message
        this.broadcastMessage({
          type: EMainRoomPhase.EndGame,
          data: {
            matchResult: matchResult,
          },
        });
      },
    });
    this.state.statusRoom = ERussianPistolRoomStatus.ENDGAME;
    this.disconnect();
  };

  async onCreate(options: any) {
    console.info('Main room created: ', options);
    this.clock.start();
    this.setState(new MainRoomState());
    this.state.LOBBY_CHANNEL = this.LOBBY_CHANNEL;
    await this.dispatcher.dispatch(new InitializeCommand(), {
      options: { roomId: options.room_id },
      callback: () => {
        this.broadcastMessage<any>({
          type: this.state.phase,
          data: {},
        });
      },
    });
    this.state.statusRoom = ERussianPistolRoomStatus.PLAYING;
    this.delayStartGame = this.clock.setTimeout(async () => {
      //NOTE: Locked
      if (this.state.queue.length > 1) {
        await this.startGame();
      } else {
        this.broadcastError(
          GameError.Time(this.state.phase, EMainRoomPhase.StartGame),
        );
      }
    }, TIME_CONFIG.WAITING_FOR_START_GAME);

    //NOTE Receive start-turn signal from client then accept by sending startturn signal from server. Need to check previous phase
    this.onMessage(
      EMessageMainRoom.DoneStartTurnAnimation,
      (client: Client) => {
        if (this.state.phase === EMainRoomPhase.StartTurn) {
          this.startAction();
        } else {
          this.broadcastError(
            GameError.Time(this.state.phase, EMainRoomPhase.StartAction),
          );
        }
      },
    );

    this.onMessage(
      EMessageMainRoom.DoneStartGameAnimation,
      (client: Client) => {
        if (this.state.phase === EMainRoomPhase.StartGame) {
          this.startTurn();
        } else {
          this.broadcastError(
            GameError.Time(this.state.phase, EMainRoomPhase.StartTurn),
          );
        }
      },
    );

    //NOTE Receive execute-action with action info
    this.onMessage(
      EMessageMainRoom.UserAction,
      (client: Client, action: TActionRoom) => {
        if (this.state.phase === EMainRoomPhase.StartAction) {
          this.executeAction(action);
        } else {
          this.broadcastError(
            GameError.Time(this.state.phase, EMainRoomPhase.ExecuteAction),
          );
        }
      },
    );

    this.onMessage(EMessageMainRoom.DoneActionAnimation, (client: Client) => {
      if (this.state.phase === EMainRoomPhase.ExecuteAction) {
        this.endTurn();
      } else {
        //TODO catch error when client send wrong timing info
        this.broadcastError(
          GameError.Time(this.state.phase, EMainRoomPhase.EndTurn),
        );
      }
    });
  }

  async onJoin(client: Client, options: any) {
    console.info(`Client ${client.sessionId} joined`);
    if (this.state.phase !== EMainRoomPhase.None) {
      client.leave(
        GameError.GameStarted().code,
        GameError.GameStarted().message,
      );
      await this.startGame();
    } else {
      await this.dispatcher.dispatch(new PlayerJoinCommand(), {
        maxClients: this.maxClients,
        client,
      });

      //NOTE: Broadcast message
      this.broadcastMessage<any>({
        type: this.state.phase,
        data: {},
      });
    }
  }

  async onLeave(client: Client, options: any) {
    console.info(`Client ${client.sessionId} left`);
  }

  async onDispose() {}
}
