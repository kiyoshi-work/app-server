import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@/database';
import { configLangchain } from './configs/langchain';
import { VectorStoreService } from './vector-store.service';
import lootMock from './mock/loot.mock';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity';
import { DocumentRepository } from './repositories/document.repository';
import { OpenAIEmbeddings } from '@langchain/openai';

const topicMock = {
  LOOT: {
    name: 'lootbot',
  },
};
@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_VECTOR_HOST || 'localhost',
        port: Number(process.env.DB_VECTOR_PORT) || 3306,
        username: process.env.DB_VECTOR_USERNAME || 'root',
        password: process.env.DB_VECTOR_PASSWORD || 'root',
        database: process.env.DB_VECTOR_DATABASE || 'test',
        logging: true,
      }),
      // inject: [],
    }),
    TypeOrmModule.forFeature([DocumentEntity]),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configLangchain],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: 'TEXT_EMBEDDING_3_LARGE',
      useFactory: async (config: ConfigService) => {
        try {
          return new OpenAIEmbeddings({
            modelName: 'text-embedding-3-large',
            openAIApiKey: config.get<string>('langchain.open_ai_key'),
          });
        } catch (e) {
          console.log('TEXT_EMBEDDING_3_LARGE');
          console.error(e);
          throw e;
        }
      },
      inject: [ConfigService],
    },
    VectorStoreService,
    DocumentRepository,
  ],
  exports: [VectorStoreService, DocumentRepository],
})
export class VectorStoreModule implements OnApplicationBootstrap {
  constructor(
    @Inject(VectorStoreService)
    private vectorService: VectorStoreService,
    @Inject('TEXT_EMBEDDING_3_LARGE')
    public embeddingModel: OpenAIEmbeddings,
    private documentRepository: DocumentRepository,
  ) { }
  async handleMockDataTopic(docs: any, keyTopicId: string) {
    let data = [];
    try {
      data = await this.vectorService.queryOrmVector('', 10, {
        keyTopicId: keyTopicId,
      });
      console.log(
        '[onApplicationBootstrap] [EveVectorStore] [DONE]: ',
        data.length,
      );
    } catch (e) {
      console.log('[ERROR] [handleMockDataTopic] :', e);
    }
    if (data.length === 0) {
      await this.vectorService.ormAddDocuments(docs);
    }
  }

  async onApplicationBootstrap() {
    const t = await this.documentRepository.findById(
      'c505eae9-a7eb-4346-be86-9115940b0298',
    );
    console.log('🚀 ~ VectorStoreModule ~ onApplicationBootstrap ~ t:', t);
    // const data = await this.documentRepository.queryOrmVector(
    //   'what is lootbot',
    //   2,
    //   {
    //     keyTopicId: 'lootbot',
    //   },
    // );
    // console.log(
    //   '🚀 ~ VectorStoreModule ~ onApplicationBootstrap ~ data:',
    //   data,
    // );
    // const data = await this.vectorService.queryOrmVector('what is lootbot', 2, {
    //   keyTopicId: 'lootbot',
    // });
    // const data = await this.vectorService.embedDocument('what is lootbot');
    // const _data = await this.vectorService.queryVector(data, 2, {
    //   keyTopicId: 'lootbot',
    // });

    // const _data = await this.documentRepository.queryVector(data, 2, {
    //   keyTopicId: 'lootbot',
    // });
    // console.log(
    //   '🚀 ~ VectorStoreModule ~ onApplicationBootstrap ~ data:',
    //   _data,
    // );

    //   const dataMock = [
    //     {
    //       keyTopicId: topicMock.LOOT.name,
    //       docs: lootMock,
    //     },
    //   ];
    //   for (const { keyTopicId, docs } of dataMock) {
    //     const _docs = docs.map((dos) => {
    //       return {
    //         ...dos,
    //         metadata: {
    //           ...dos.metadata,
    //           keyTopicId,
    //         },
    //       };
    //     });
    //     await this.handleMockDataTopic(_docs, keyTopicId);
    //   }
  }
}
