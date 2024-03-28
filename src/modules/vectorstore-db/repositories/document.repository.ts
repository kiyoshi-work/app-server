import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Document } from '@langchain/core/documents';
import { DocumentEntity } from '../entities/document.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { ConfigService } from '@nestjs/config';
import { TypeORMVectorStore } from '@langchain/community/vectorstores/typeorm';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Inject } from '@nestjs/common';

export class DocumentRepository extends Repository<DocumentEntity> {
  private appDataSource: DataSource;
  private pgvectorStore: TypeORMVectorStore;
  private postgresConnectionOptions: PostgresConnectionOptions;

  constructor(
    // @InjectRepository(DocumentEntity)
    // private readonly documentRepository: Repository<DocumentEntity>,
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService,
    @Inject('TEXT_EMBEDDING_3_LARGE')
    public embeddingModel: OpenAIEmbeddings,
  ) {
    super(DocumentEntity, dataSource.createEntityManager());
    // this.documentRepository.init
  }

  async onModuleInit() {
    this.postgresConnectionOptions =
      this.configService.get<PostgresConnectionOptions>('langchain.db');

    this.appDataSource = new DataSource({
      entities: [DocumentEntity],
      ...this.configService.get<PostgresConnectionOptions>('langchain.db'),
    });
    await this.appDataSource.initialize();

    this.pgvectorStore = await TypeORMVectorStore.fromDataSource(
      this.embeddingModel,
      {
        postgresConnectionOptions: this.postgresConnectionOptions,
        tableName: this.metadata.tableName,
      },
    );
    await this.pgvectorStore.ensureTableInDatabase();
  }

  async queryVector(query: number[], k: number = 10, filter?: any) {
    console.log(this.metadata.tableName, 'sss');
    const embeddingString = `[${query.join(',')}]`;
    const _filter = JSON.stringify(filter ?? '{}');
    const documents = await this.appDataSource
      .createQueryBuilder()
      .from(DocumentEntity, 'document')
      // .where({
      //   id: 'c9d6b6b3-1f01-4ed2-b0b4-34abbfeb5315',
      // })
      .andWhere(`metadata @> '${_filter}'`)
      .select('*')
      .addSelect(`embedding <=> '${embeddingString}' as "_distance"`)
      .orderBy('_distance', 'ASC')
      .limit(k)
      .getRawMany();
    // const queryString = `
    // SELECT *, embedding <=> $1 as "_distance"
    // FROM ${this.metadata.tableName}
    // WHERE metadata @> $2
    // ORDER BY "_distance" ASC
    // LIMIT $3;`;
    // const documents = await this.appDataSource.query(queryString, [
    //   embeddingString,
    //   _filter,
    //   k,
    // ]);
    const results = [];
    for (const doc of documents) {
      if (doc._distance != null && doc.pageContent != null) {
        const document: any = new Document(doc);
        document.id = doc.id;
        results.push([document, doc._distance]);
      }
    }
    return results;
  }

  async findById(id: string) {
    return await this.find({ where: { id } });
  }

  async ormAddDocuments(docs = []) {
    await this.pgvectorStore.addDocuments(docs);
  }

  async queryOrmVector(q: string, limit: number = 10, filter?: any) {
    try {
      const vectors = await this.embeddingModel.embedDocuments([q]);
      const results = await this.queryVector(vectors?.[0], limit, filter);
      return results;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
