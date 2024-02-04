import { Module } from '@nestjs/common';
import { GCPubSubService } from './services/google-pubsub.service';
import { ConfigModule } from '@nestjs/config';
import { configGCPubSub } from './configs/gcpubsub';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configGCPubSub],
    }),
  ],
  controllers: [],
  providers: [GCPubSubService],
  exports: [GCPubSubService],
})
export class PublisherModule {}
