import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { configMilvus } from './configs/milvus';
import { MilvusDocumentRepository } from './repositories/document.repository';
import solana_v2 from './mock/solana_v2.json';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configMilvus],
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
    MilvusDocumentRepository,
  ],
  exports: ['TEXT_EMBEDDING_3_LARGE', MilvusDocumentRepository],
})
export class MilvusModule implements OnApplicationBootstrap {
  constructor(
    @Inject('TEXT_EMBEDDING_3_LARGE')
    public embeddingModel: OpenAIEmbeddings,
    public milvusDocumentRepository: MilvusDocumentRepository,
  ) { }

  async onApplicationBootstrap() {
    // const address = 'milvus:19530';
    // const milvusClient = new MilvusClient(address);
    //   const params = {
    //     collection_name: 'documents',
    //     description: 'Document vectorstore',
    //     fields: [
    //       {
    //         name: 'book_intro',
    //         description: '',
    //         data_type: 101, // DataType.FloatVector
    //         type_params: {
    //           dim: '2',
    //         },
    //       },
    //       {
    //         name: 'book_id',
    //         data_type: 5, //DataType.Int64
    //         is_primary_key: true,
    //         description: '',
    //       },
    //       {
    //         name: 'word_count',
    //         data_type: 5, //DataType.Int64
    //         description: '',
    //       },
    //     ],
    //   };
    // const m = await milvusClient.checkHealth();
    // console.log('🚀 ~ VectorStoreModule ~ onApplicationBootstrap ~  m:', m);
    //   // await milvusClient.createCollection(params);
    //   const l = await milvusClient.describeCollection({
    //     collection_name: 'book',
    //   });
    //   await milvusClient.getCollectionStatistics({
    //     collection_name: 'book',
    //   });
    //   console.log('🚀 ~ VectorStoreModule ~ onApplicationBootstrap ~ l:', l);
    //   const t = await milvusClient.showCollections();
    //   console.log('🚀 ~ VectorStoreModule ~ onApplicationBootstrap ~ t:', t);
    //   const i = await milvusClient.loadCollection({
    //     collection_name: 'book',
    //   });
    //   const searchParams = {
    //     anns_field: 'book_intro',
    //     topk: '2',
    //     metric_type: 'L2',
    //     params: JSON.stringify({ nprobe: 10 }),
    //   };
    //   // const results = await milvusClient.search({
    //   //   collection_name: 'book',
    //   //   expr: '',
    //   //   vectors: [[0.1, 0.2]],
    //   //   search_params: searchParams,
    //   //   vector_type: 101, // DataType.FloatVector
    //   // });
    //   // console.log(
    //   //   '🚀 ~ VectorStoreModule ~ onApplicationBootstrap ~ results:',
    //   //   results,
    //   // );
    //   const results = await milvusClient.query({
    //     collection_name: 'book',
    //     expr: 'book_id in [2,4,6,8]',
    //     output_fields: ['book_id', 'book_intro'],
    //   });
    //   console.log(
    //     '🚀 ~ VectorStoreModule ~ onApplicationBootstrap ~ results:',
    //     results,
    //   );
    // //   const vectorStore = await Milvus.fromTexts(
    // //     [
    // //       'Tortoise: Labyrinth? Labyrinth? Could it Are we in the notorious Little\
    // //               Harmonic Labyrinth of the dreaded Majotaur?',
    // //       'Achilles: Yiikes! What is that?',
    // //       'Tortoise: They say-although I person never believed it myself-that an I\
    // //               Majotaur has created a tiny labyrinth sits in a pit in the middle of\
    // //               it, waiting innocent victims to get lost in its fears complexity.\
    // //               Then, when they wander and dazed into the center, he laughs and\
    // //               laughs at them-so hard, that he laughs them to death!',
    // //       'Achilles: Oh, no!',
    // //       "Tortoise: But it's only a myth. Courage, Achilles.",
    // //     ],
    // //     [{ id: 2 }, { id: 1 }, { id: 3 }, { id: 4 }, { id: 5 }],
    // //     this.embeddingModel,
    // //     {
    // //       collectionName: 'goldel_escher_bach',
    // //     },
    // //   );

    if (
      !(await this.milvusDocumentRepository.checkDocumentExist('solana_v2'))
    ) {
      await this.milvusDocumentRepository.ormAddDocuments(
        solana_v2.map((dt) => ({
          ...dt,
          metadata: { ...dt.metadata, docName: 'solana_v2' },
        })),
      );
      console.log(`ADD solana_v2 : ${solana_v2.length}`);
    }
    // await this.milvusDocumentRepository.checkDocumentExist('solana_v2');
    const _data = await this.milvusDocumentRepository.queryOrmVector(
      'what is solana',
      1,
    );
    console.log(
      '🚀 ~ VectorStoreModule ~ onApplicationBootstrap ~ data:',
      _data,
    );
    // const del = await this.milvusDocumentRepository.deleteByIds([
    //   '449348610621178587',
    // ]);
    // console.log('🚀 ~ MilvusModule ~ onApplicationBootstrap ~ del:', del);
  }
}
