import io from 'socket.io-client';
import zlib from 'zlib';
// const socket = io('ws://localhost:9002/price', {
//   transports: ['websocket'],
// }); // Use your server's address
// (async () => {
//   socket.on('newTopAskBid', (payload: any) => {
//     const buf = Buffer.from(payload);
//     const decodedMsg = zlib.gunzipSync(buf).toString('utf-8');
//     console.log(
//       '🚀 ~ file: price.ts:121 ~ onMessageBingX ~ decodedMsg:',
//       decodedMsg,
//     );
//   });

//   socket.on('open', (payload: any) => {
//     console.log(payload);
//     socket.send({
//       method: 'sub',
//       type: 'price',
//       params: {
//         token: 'AITECH',
//       },
//     });
//     // socket.send({
//     //   method: 'unsub',
//     //   type: 'price',
//     //   params: {
//     //     token: 'AITECH',
//     //   }
//     // });
//   });
// })();

const socket = io('ws://localhost:9002/chat', {
  transports: ['websocket'],
});
(async () => {
  socket.emit('ping');
  socket.on('pong', (payload: any) => {
    console.log('pong');
  });
  socket.on('chat', (payload: any) => {
    console.log('🚀 ~ socket.on ~ payload:', payload);
  });
  socket.send({
    // question: 'eth price',
    question: 'What is chatgpt',
  });
})();
