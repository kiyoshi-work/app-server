/**
 * Service for managing vector storage and performing operations like adding documents
 * and conducting similarity searches using PGVector and OpenAI embeddings.
 *
 * This service initializes a PostgreSQL connection pool, sets up a vector store using
 * PGVector, and provides methods to add documents to the store and perform similarity
 * searches. It ensures that the necessary database schema and extensions are created
 * during module initialization and properly releases resources on module destruction.
 *
 * @class VectorStoreService
 * @decorator Injectable - Marks the class as a service that can be injected.
 *
 * @property {PGVectorStore} pgvectorStore - The PGVector store instance for storing
 *                                           and searching vectors.
 * @property {pg.Pool} pool - The PostgreSQL connection pool for database operations.
 *
 * @method onModuleInit - Initializes the service by setting up the database schema and
 *                        configuring the PGVector store. It is automatically called by
 *                        NestJS when the module is initialized.
 *
 * @method ensureDatabaseSchema - Ensures the required database schema and extensions
 *                                are present. It creates them if they don't exist.
 *                                This method is private and only called internally.
 *
 * @method addDocuments - Adds an array of documents to the vector store. Each document
 *                        is processed to extract its vector representation before storage.
 *
 * @method similaritySearch - Performs a similarity search in the vector store based on
 *                            a query string and returns the most similar documents up to
 *                            a specified limit.
 *
 * @method onModuleDestroy - Cleans up resources by ending the PostgreSQL pool connection.
 *                           It is automatically called by NestJS when the module is
 *                           destroyed.
 */

import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as pg from 'pg';
import { Document } from '@langchain/core/documents';
import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeORMVectorStore } from '@langchain/community/vectorstores/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const EMBEDDING_MODEL_NAME = 'text-embedding-3-large';

@Injectable()
export class VectorStoreService {
  private pgvectorStore: TypeORMVectorStore;
  private pool: pg.Pool;
  private embeddingModel: OpenAIEmbeddings;
  private postgresConnectionOptions: PostgresConnectionOptions;
  private tableName: string;

  constructor(public configService: ConfigService){}

  async onModuleInit(
  ) {
    this.postgresConnectionOptions = this.configService.get<PostgresConnectionOptions>('langchain.db');
    this.tableName = this.configService.get<string>('langchain.tableName');

    // this.pool = new pg.Pool({
    //   ...postgresConnectionOptions, 
    //   user: postgresConnectionOptions?.username
    // });
    // await this.ensureDatabaseSchema();    
    this.embeddingModel = new OpenAIEmbeddings({
      modelName: EMBEDDING_MODEL_NAME,
      openAIApiKey: this.configService.get<string>('langchain.open_ai_key'),
    });

    this.pgvectorStore = await TypeORMVectorStore.fromDataSource(
      this.embeddingModel,
      {
        postgresConnectionOptions: this.postgresConnectionOptions, 
        tableName: this.tableName,
      },
    );
    await this.pgvectorStore.ensureTableInDatabase();
  }

  async embedDocuments(documents: any) {
    const vectors = await this.embeddingModel.embedDocuments(documents);
    console.log(vectors);
    return vectors;
  }

  async embedDocument(document: any) {
    const vectors = await this.embeddingModel.embedDocuments([document]);
    return vectors?.[0];
  }

  private async ensureDatabaseSchema() {
    const columns = this.configService.get<any>('langchain.columns');
    const tableName = this.configService.get<string>('langchain.tableName');
    const client = await this.pool.connect();
    try {
      // Check and create table and columns
      const query = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${columns.idColumnName} UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ${columns.vectorColumnName} VECTOR,
        ${columns.contentColumnName} TEXT,
        ${columns.metadataColumnName} JSONB
      );
    `;
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
      await client.query(query);
    } finally {
      client.release();
    }
  }

  async addDocuments(documents: Document[]): Promise<void> {
    await this.pgvectorStore.addDocuments(documents);
  }

  async similaritySearch(query: string, limit: number): Promise<any> {
    return this.pgvectorStore.similaritySearch(query, limit);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async queryOrmVector(q: string, limit: number = 10, filter?: any) {
    const typeormVectorStore = await TypeORMVectorStore.fromExistingIndex(
      this.embeddingModel,
      {
        postgresConnectionOptions: this.postgresConnectionOptions, 
        tableName: this.tableName,
      },
    );
    const results = await typeormVectorStore.similaritySearchWithScore(
      q,
      limit,
      filter,
    );
    return results;
  }

  async queryVector(q: number[], limit: number = 10, filter?: any) {
    const results = await this.pgvectorStore.similaritySearchVectorWithScore(
      q,
      limit,
      filter,
    );
    return results;
  }


  async ormAddDocuments(docs = []) {
    const sanitizedDocs = docs?.map((doc) => {
      return {
        ...doc,
        pageContent: doc?.pageContent.replace(/\0/g, ''),
      };
    });
    const typeormVectorStore = await TypeORMVectorStore.fromDataSource(
      this.embeddingModel,
      {
        postgresConnectionOptions: this.postgresConnectionOptions, 
        tableName: this.tableName,
      },
          );
    await typeormVectorStore.ensureTableInDatabase();
    await typeormVectorStore.addDocuments(sanitizedDocs);
    return true;
  }

}