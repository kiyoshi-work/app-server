import io from 'socket.io-client';
import zlib from 'zlib';
const socket = io('ws://localhost:80', {
  transports: ['websocket']
}
); // Use your server's address
(async () => {
  socket.on('newTopAskBid', (payload: any) => {
    const buf = Buffer.from(payload);
    const decodedMsg = zlib.gunzipSync(buf).toString('utf-8');
    console.log("🚀 ~ file: price.ts:121 ~ onMessageBingX ~ decodedMsg:", decodedMsg)
  });

  socket.on('open', (payload: any) => {
    console.log(payload);
    socket.send({
      method: 'sub',
      type: 'price',
      params: {
        token: 'AITECH',
      }
    });
    // socket.send({
    //   method: 'unsub',
    //   type: 'price',
    //   params: {
    //     token: 'AITECH',
    //   }
    // });
  });
})()
