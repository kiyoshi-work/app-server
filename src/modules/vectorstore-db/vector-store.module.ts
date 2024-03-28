import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database';
import { configLangchain } from './configs/langchain';
import { VectorStoreService } from './vector-store.service';
import lootMock from './mock/loot.mock';

const topicMock = {
  LOOT: {
    name: 'lootbot',
  },
};
@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configLangchain],
    }),
  ],
  controllers: [],
  providers: [VectorStoreService],
  exports: [VectorStoreService],
})
export class VectorStoreModule implements OnApplicationBootstrap{
  constructor(
    @Inject(VectorStoreService)
    private vectorService: VectorStoreService
  ){

  }
  async handleMockDataTopic(docs: any, keyTopicId: string) {
    let data = [];
    try {
      data = await this.vectorService.queryOrmVector('', 10, { keyTopicId: keyTopicId });
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
    const dataMock = [
      {
        keyTopicId: topicMock.LOOT.name,
        docs: lootMock,
      },
    ];
    for (const { keyTopicId, docs } of dataMock) {
      const _docs = docs.map((dos) => {
        return {
          ...dos,
          metadata: {
            ...dos.metadata,
            keyTopicId,
          },
        };
      });
      console.log("🚀 ~ VectorStoreModule ~ const_docs=docs.map ~ _docs:", _docs)
      await this.handleMockDataTopic(_docs, keyTopicId);
    }
  }
}
