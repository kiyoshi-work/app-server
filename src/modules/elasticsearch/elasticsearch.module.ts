import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ESService } from './services/elasticsearch.service';
import { configElasticsearch } from './configs/elasticsearch';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configElasticsearch],
    }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        configService.get('elasticsearch'),
      inject: [ConfigService],
    }),
  ],
  providers: [ESService],
})
export class ElasticSearchModule { }
