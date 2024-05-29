import { registerAs } from '@nestjs/config';
import { ElasticsearchModuleOptions } from '@nestjs/elasticsearch/dist/interfaces/elasticsearch-module-options.interface';

export const configElasticsearch = registerAs(
  'elasticsearch',
  (): ElasticsearchModuleOptions => ({
    node: process.env.ELASTICSEARCH_NODE || 'http://elasticsearch:9200',
  }),
);
