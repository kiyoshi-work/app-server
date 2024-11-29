import { registerAs } from '@nestjs/config';

export const configGCPubSub = registerAs('gc_pubsub', () => ({
  apiEndpoint:
    process.env.GC_PUBSUB_ENDPOINT || 'http://app-server-pubsub:8085',
  projectId: process.env.GC_PROJECT_ID || 'app-server-pubsub',
  topic: process.env.GC_PUBSUB_TOPIC || 'default_topic',
}));
