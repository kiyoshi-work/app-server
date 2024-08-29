// eslint-disable-file no-use-before-define
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  db: 1,
});
(async () => {
  await redis.subscribe('TEST_MQ_EVENT');
  redis.on('message', (channel: string, message: string) => {
    console.log(`Received message on channel ${channel}: ${message}`);
  });
})();
