import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import * as http from 'http';
import {
  Server,
  Room,
  RedisPresence,
  Presence,
  RedisDriver,
  MatchMakerDriver,
} from 'colyseus';

import { WebSocketTransport } from '@colyseus/ws-transport';
import { MainRoom } from './rooms/main.room';
import { ERoomDefine } from '@/shared/constants/enums';

type Type<T> = new (...args: any[]) => T;
// room: Type<Room<any, any>>
@Injectable()
export class GameService implements OnApplicationShutdown {
  server: Server = null;

  createServer(httpServer: http.Server) {
    if (this.server) return;
    const transportColyseus = new WebSocketTransport();
    const redisPresenceColyseus = new RedisPresence({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT) || 6379,
      db: Number(process.env.REDIS_DATABASE) || 0,
    }) as Presence;

    const redisDriverColyseus = new RedisDriver({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT) || 6379,
      db: Number(process.env.REDIS_DATABASE) || 0,
    }) as MatchMakerDriver;

    this.server = new Server({
      //   server: httpServer,
      transport: transportColyseus,
      presence: redisPresenceColyseus,
      driver: redisDriverColyseus,
    });
    this.server.attach({
      server: httpServer,
    });
  }
  defineRooms() {
    this.server.define(ERoomDefine.MAIN_ROOM, MainRoom);
  }

  listen(port: number): Promise<unknown> {
    if (!this.server) return;
    return this.server.listen(port);
  }

  onApplicationShutdown(sig) {
    if (!this.server) return;
    console.info(
      `Caught signal ${sig}. Game service shutting down on ${new Date()}.`,
    );
    this.server.gracefullyShutdown();
  }
}
