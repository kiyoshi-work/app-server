import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import {
  BadRequestException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { LoggerService } from '@/logger';
import {
  ESocketMethod,
  ESocketType,
  TPriceSocket,
} from '@/shared/dto/price.dto';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '@/database/repositories';
import zlib from 'zlib';

const SOCKET_PORT = Number(process.env.SOCKET_PORT) || 9000;
@WebSocketGateway(SOCKET_PORT, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e8,
})
export class PriceGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @Inject(LoggerService)
  private readonly loggerService: LoggerService;

  @WebSocketServer() wss: Server;

  // @Inject(JwtService)
  // private jwtService: JwtService;

  // @Inject(UserRepository)
  // private userRepository: UserRepository;

  afterInit(server: Server) {
    this.loggerService.log('Initialized .....');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.wss.emit('open');
  }

  handleDisconnect(client: Socket) {
    this.loggerService.log(`Client disconnected: ${client.id}`);
    // this.wss.emit('disconnect');
  }

  @SubscribeMessage('ping')
  ping() {
    this.wss.emit('pong');
  }

  @SubscribeMessage('message')
  async receiveMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TPriceSocket,
  ) {
    try {
      const { method, params, type } = data;
      switch (type) {
        case ESocketType.PRICE:
          if (!params?.token) {
            throw new BadRequestException(
              `User ${client.id} not provide token!`,
            );
          }
          if (type === ESocketType.PRICE) {
            if (method === ESocketMethod.SUB) {
              client.join(params?.token);
              this.loggerService.log(
                `Client ${client.id} connected room ${params?.token}`,
              );
            }
            if (method === ESocketMethod.UNSUB) {
              client.leave(params?.token);
              this.loggerService.log(
                `Client ${client.id} leaved room ${params?.token}`,
              );
            }
          }
          break;
        // case ESocketType.USER:
        //   if (method === ESocketMethod.SUB) {
        //     const payload = await this.jwtService.verifyAsync(
        //       String(params.access_token),
        //       {
        //         secret: process.env.JWT_SECRET_KEY,
        //       },
        //     );
        //     if (!payload.sub) {
        //       throw new BadRequestException(`Invalid accesstoken!`);
        //     }
        //     const userDB = await this.userRepository.findOneById(payload?.sub);
        //     if (!userDB) {
        //       throw new UnauthorizedException(`Not found user in DB!`);
        //     }
        //     const roomId = `${userDB.id}`;
        //     client.join(roomId);
        //     this.loggerService.log(
        //       `Client ${client.id} connected room ${roomId}`,
        //     );
        //   }
        //   break;
        default:
          client.disconnect();
          break;
      }
    } catch (error) {
      console.error(error);
      client.emit('error', { message: error.message, name: error.name });
      client.disconnect();
    }
  }

  emitNewPice(token: string, data: any) {
    try {
      const compressed = zlib.gzipSync(JSON.stringify(data));
      this.wss.to(token).emit('newPrice', compressed);
    } catch (error) {
      console.log(
        '🚀 ~ file: price.gateway.ts:56 ~ emitNewPice ~ error:',
        error,
      );
    }
  }

  emitNewTopBidAsk(token: string, data: any) {
    try {
      const compressed = zlib.gzipSync(JSON.stringify(data));
      this.wss.to(token).emit('newTopAskBid', compressed);
    } catch (error) {
      console.log(
        '🚀 ~ file: price.gateway.ts:56 ~ emitNewPice ~ error:',
        error,
      );
    }
  }
}
