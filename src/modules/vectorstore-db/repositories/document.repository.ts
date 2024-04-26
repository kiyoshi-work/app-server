import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Document } from '@langchain/core/documents';
import { DocumentEntity } from '../entities/document.entity';
import { ConfigService } from '@nestjs/config';
import { TypeORMVectorStore, TypeORMVectorStoreArgs } from '@langchain/community/vectorstores/typeorm';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Inject } from '@nestjs/common';
import { EmbeddingsInterface } from '@langchain/core/embeddings';

export class DocumentRepository extends Repository<DocumentEntity> {
  // private appDataSource: DataSource;
  // private pgvectorStore: TypeORMVectorStore;
  // private postgresConnectionOptions: PostgresConnectionOptions;

  constructor(
    // @InjectRepository(DocumentEntity)
    // private readonly documentRepository: Repository<DocumentEntity>,
    @InjectDataSource('vector') private dataSource: DataSource,
    private configService: ConfigService,
    @Inject('TEXT_EMBEDDING_3_LARGE')
    public embeddingModel: OpenAIEmbeddings,
  ) {
    super(DocumentEntity, dataSource.createEntityManager());
  }

  async onModuleInit() {
    // this.postgresConnectionOptions =
    //   this.configService.get<PostgresConnectionOptions>('langchain.db');

    // this.appDataSource = new DataSource({
    //   entities: [DocumentEntity],
    //   ...this.configService.get<PostgresConnectionOptions>('langchain.db'),
    // });
    // await this.appDataSource.initialize();

    // this.pgvectorStore = await TypeORMVectorStore.fromDataSource(
    //   this.embeddingModel,
    //   {
    //     postgresConnectionOptions: this.postgresConnectionOptions,
    //     tableName: this.metadata.tableName,
    //   },
    // );
    // await this.pgvectorStore.ensureTableInDatabase();
    await this.ensureDatabaseSchema();
  }

  private async ensureDatabaseSchema() {
    // TODO: write in migrate file
    try {
      // Check and create table and columns
      const query = `
      CREATE TABLE IF NOT EXISTS ${this.metadata.tableName} (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        embedding VECTOR,
        "pageContent" TEXT,
        metadata JSONB
      );
    `;
      await this.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      await this.query('CREATE EXTENSION IF NOT EXISTS vector');
      await this.query(query);
    } catch (error) {
      throw error;
    }
  }

  async queryVector(query: number[], k: number = 10, filter?: any) {
    console.log(this.metadata.tableName, 'sss');
    const embeddingString = `[${query.join(',')}]`;
    const _filter = JSON.stringify(filter ?? '{}');
    const documents = await this
      .createQueryBuilder('document')
      // .from(DocumentEntity, 'document')
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

  /**
   * Static method to create a new `TypeORMVectorStore` instance from an
   * array of texts and their metadata. It converts the texts into
   * `Document` instances and adds them to the store.
   * @param texts Array of texts.
   * @param metadatas Array of metadata objects or a single metadata object.
   * @param embeddings Embeddings instance.
   * @param dbConfig `TypeORMVectorStoreArgs` instance.
   * @returns Promise that resolves with a new instance of `TypeORMVectorStore`.
   */
  static async fromTexts(texts: string[], metadatas: object[] | object, embeddings: EmbeddingsInterface, dbConfig: TypeORMVectorStoreArgs): Promise<TypeORMVectorStore> {
    const docs = [];
    for (let i = 0; i < texts.length; i += 1) {
      const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
      const newDoc = new Document({
        pageContent: texts[i],
        metadata,
      });
      docs.push(newDoc);
    }
    return TypeORMVectorStore.fromDocuments(docs, embeddings, dbConfig);
  }

  /**
 * Method to add vectors to the vector store. It converts the vectors into
 * rows and inserts them into the database.
 * @param vectors Array of vectors.
 * @param documents Array of `Document` instances.
 * @returns Promise that resolves when the vectors have been added.
 */
  async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
    const rows: any[] = vectors.map((embedding, idx) => {
      const embeddingString = `[${embedding.join(",")}]`;
      const documentRow = {
        pageContent: documents[idx].pageContent,
        embedding: embeddingString,
        metadata: documents[idx].metadata,
      };
      return documentRow;
    });
    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      try {
        await this.save(chunk);
      }
      catch (e) {
        console.error(e);
        throw new Error(`Error inserting: ${chunk[0].pageContent}`);
      }
    }
  }
  /**
   * Method to add documents to the vector store. It ensures the existence
   * of the table in the database, converts the documents into vectors, and
   * adds them to the store.
   * @param documents Array of `Document` instances.
   * @returns Promise that resolves when the documents have been added.
   */
  async addDocuments(documents: any[]) {
    const texts = documents.map(({ pageContent }) => pageContent);
    return this.addVectors(await this.embeddingModel.embedDocuments(texts), documents);
  }


  async findById(id: string) {
    return this.createQueryBuilder('document')
      .where('document.id = :id', { id })
      .limit(1)
      .getOne();
  }

  async ormAddDocuments(docs = []) {
    const sanitizedDocs = docs?.map((doc) => {
      return {
        ...doc,
        pageContent: doc?.pageContent.replace(/\0/g, ''),
      };
    });
    await this.addDocuments(sanitizedDocs);
    return true;
  }

  async queryOrmVector(
    q: string,
    limit: number = 10,
    filter: any = {},
    isExactPoint: boolean = false,
  ) {
    try {
      const vector = await this.embeddingModel.embedQuery(q);
      const results = await this.queryVector(vector, limit, filter);
      const data = results.map(([doc, distance]) => {
        return isExactPoint ? { ...doc, distance } : doc;
      });
      return data;
    } catch (error) {
      console.log(error);
      return [];
      // throw error;
    }
  }
}
