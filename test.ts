// Sample JavaScript client code (using Socket.io client)

import io from 'socket.io-client';

const socket = io('ws://localhost:80/price', {query: {token: 'eth'}}); // Use your server's address


(() => {
  socket.on('newPrice', (payload: any) => {
    console.log(payload);
  });
})()