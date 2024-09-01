// eslint-disable-file no-use-before-define
import { io } from 'socket.io-client';
import WebSocket from 'ws';

let socket: any;
const loadSocket = () => {
  if (!socket || socket?.readyState !== WebSocket.OPEN) {
    socket?.close();
    socket = io('ws://localhost:89/chat', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });
    socket.emit('ping');
    socket.on('pong', (payload: any) => {
      console.log('🚀 PONG', payload);
    });
    socket.on('chat', (payload: any) => {
      console.log('🚀 ~ socket.on ~ payload:', payload);
    });
    socket.on('disconnect', (payload: any) => {
      console.log('WebSocket disconnect');
      setTimeout(() => {
        loadSocket();
      }, 500);
    });
  }
};
// =======================================  MAIN ========================================
// LISTEN SOCKET
(async () => {
  loadSocket();
})();
