import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  ELASTICSEARCH_INDEX,
  ESExampleDataIndex,
  ElasticSearchFilter,
} from '../elasticsearch.dto';

@Injectable()
export class ESService implements OnApplicationBootstrap {
  constructor(private readonly elasticsearchService: ElasticsearchService) { }

  private buildQueryFilter = (filters: ElasticSearchFilter) => {
    const query = {};
    if (filters.search_text) {
      query['multi_match'] = {
        query: filters.search_text,
        fields: ['name'],
        fuzziness: 'AUTO',
      };
    }
    return query;
  };

  // create game index
  async createExampleIndex(id: string) {
    const indexName = `${ELASTICSEARCH_INDEX.EXAMPLE_BY_ID}${id}`;
    const exists = await this.elasticsearchService.indices.exists({
      index: indexName,
    });
    if (!exists) {
      await this.elasticsearchService.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              id: { type: 'text' },
              name: { type: 'text' },
              logo_url: { type: 'text' },
              cover_url: { type: 'text' },
              expired_at: { type: 'date' },
              // trait_ids: {
              //   type: 'text',
              //   fields: {
              //     keyword: {
              //       type: 'keyword',
              //     },
              //   },
              // },
            },
          },
        },
      });
    }
  }

  async onApplicationBootstrap() {
    // create game index
  }

  async searchGame(
    id: string,
    filter: ElasticSearchFilter,
  ): Promise<ESExampleDataIndex[]> {
    const { hits } = await this.elasticsearchService.search<ESExampleDataIndex>(
      {
        index: ELASTICSEARCH_INDEX.EXAMPLE_BY_ID + id,
        query: this.buildQueryFilter(filter),
      },
    );
    return hits.hits.map((item) => item._source);
  }

  async createIndexGame(id: string, data: any) {
    return await this.elasticsearchService.index<ESExampleDataIndex>({
      index: ELASTICSEARCH_INDEX.EXAMPLE_BY_ID + id,
      id: data.id,
      document: data,
    });
  }
}
