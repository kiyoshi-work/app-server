import { AiService } from '@/ai/services/ai.service';
import { EAIModel } from '@/shared/constants/enums';
import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
const SOCKET_PORT = Number(process.env.SOCKET_PORT) || 9000;
@WebSocketGateway(SOCKET_PORT, {
  namespace: 'chat',
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e8,
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  connectedUsers: Map<string, string> = new Map();
  @Inject(AiService)
  private aiService: AiService;

  afterInit(server: Server) {
    Logger.log(`🚀 Websocket for chatbox is running in port ${SOCKET_PORT}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {}

  handleDisconnect(client: Socket) {
    // this.connectedUsers.delete(client.id);
    console.log(`Client disconnected chatbox: ${client.id}`);
  }

  @SubscribeMessage('message')
  async receiveMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    console.log('🚀 ~ data:', client.id, '==', data);
    const { question } = data;
    await this.aiService.handleStreamAPI(
      { question, modelName: EAIModel.GPT_4O_MINI },
      (data: any) => this.emitChatResponse(client.id, data),
    );
  }

  emitChatResponse(clientId: string, data: any) {
    try {
      // const compressed = zlib.gzipSync(JSON.stringify(data));
      this.wss.to(clientId).emit('chat', data);
    } catch (error) {
      console.log('🚀 ~ emitChatResponse ~ error:', error);
    }
  }
}
