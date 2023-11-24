import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { BadRequestException, Inject } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { LoggerService } from '@/logger';

const SOCKET_PORT = Number(process.env.SOCKET_PORT) || 80;
@WebSocketGateway(SOCKET_PORT, {
  namespace: 'price',
  cors: {
    origin: '*',
  },
})
export class PriceGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @Inject(LoggerService)
  private readonly loggerService: LoggerService;

  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.loggerService.log('Initialized .....');
  }

  handleConnection(client: Socket, ...args: any[]) {
    const { token } = client?.handshake?.query;
    // TODO: validate token here
    if (!token) {
      console.error(`User ${client.id} not provide token!`);
      this.wss.disconnectSockets(true);
      return;
      // throw new BadRequestException(`User ${client.id} not provide token!`);
    }
    client.join(token);
    this.loggerService.log(`Client ${client.id} connected room ${token}`);
  }

  handleDisconnect(client: Socket) {
    this.loggerService.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  ping() {
    this.wss.emit('pong');
  }

  emitNewPice(token: string, data: any) {
    try {
      this.wss.to(token).emit('newPrice', { ...data, s: token });
    } catch (error) {
      console.log(
        '🚀 ~ file: price.gateway.ts:56 ~ emitNewPice ~ error:',
        error,
      );
    }
  }
}
