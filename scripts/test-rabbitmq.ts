// eslint-disable-file no-use-before-define
import { Connection } from 'rabbitmq-client';
(async () => {
  const rabbit = new Connection('amqp://root:123456@localhost:5672');
  rabbit.createConsumer(
    {
      queue: 'rabbit-mq-queue',
      queueOptions: { durable: true },
      // handle 2 messages at a time
      qos: { prefetchCount: 5 },
    },
    async (msg) => {
      console.log(msg);
    },
  );
})();
