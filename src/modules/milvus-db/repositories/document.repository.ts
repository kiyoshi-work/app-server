import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Inject, OnApplicationBootstrap } from '@nestjs/common';
import { MilvusClient, ErrorCode, DataType } from '@zilliz/milvus2-sdk-node';
import { Milvus } from 'langchain/vectorstores/milvus';
import { Document } from '@langchain/core/documents';

export class MilvusDocumentRepository
  extends Milvus
  implements OnApplicationBootstrap
{
  public collectionName: string;
  public client: MilvusClient;
  constructor(
    private configService: ConfigService,
    @Inject('TEXT_EMBEDDING_3_LARGE')
    public embeddingModel: OpenAIEmbeddings,
  ) {
    const collectionName = 'documents';
    super(embeddingModel, {
      collectionName: collectionName,
      primaryField: 'id',
      vectorField: 'embedding',
      textField: 'pageContent',
      clientConfig: {
        address: `${configService.get('milvus.db.host')}:${configService.get('milvus.db.port')}`,
        username: configService.get('milvus.db.username'),
        password: configService.get('milvus.db.password'),
        database: configService.get('milvus.db.database'),
      },
    });
    console.log(
      "🚀 ~ MilvusDocumentRepository ~ `${configService.get('milvus.db.host')}:${configService.get('milvus.db.port')}`:",
      `${configService.get('milvus.db.host')}:${configService.get(
        'milvus.db.port',
      )}`,
    );
    this.collectionName = collectionName;
    this.indexCreateParams = {
      index_type: 'HNSW',
      metric_type: 'L2',
      params: JSON.stringify({ M: 8, efConstruction: 64 }),
    };
  }

  async onApplicationBootstrap() {
    await this.migrate();
  }

  async migrate() {
    const hasColResp = await this.client.hasCollection({
      collection_name: this.collectionName,
    });
    if (hasColResp.status.error_code !== ErrorCode.SUCCESS) {
      console.log(
        `Error checking collection: ${JSON.stringify(hasColResp, null, 2)}`,
      );
      return;
    }
    if (hasColResp.value === false) {
      const fieldList = [];
      fieldList.push(
        {
          name: 'docName',
          data_type: DataType.VarChar,
          type_params: {
            max_length: 100,
          },
        },
        {
          name: 'language',
          data_type: DataType.VarChar,
          type_params: {
            max_length: 1000,
          },
        },
        {
          name: 'description',
          data_type: DataType.VarChar,
          type_params: {
            max_length: 65000,
          },
        },
        {
          name: 'title',
          data_type: DataType.VarChar,
          type_params: {
            max_length: 10000,
          },
        },

        {
          name: 'source',
          data_type: DataType.VarChar,
          type_params: {
            max_length: 10000,
          },
        },
        {
          name: this.primaryField,
          description: 'Primary key',
          data_type: DataType.Int64,
          is_primary_key: true,
          autoID: this.autoId,
        },
        {
          name: this.textField,
          description: 'Text field',
          data_type: DataType.VarChar,
          type_params: {
            max_length: 65000,
          },
        },
        {
          name: this.vectorField,
          description: 'Vector field',
          data_type: DataType.FloatVector,
          type_params: {
            dim: 3072,
          },
        },
      );
      const createRes = await this.client.createCollection({
        collection_name: this.collectionName,
        fields: fieldList,
      });
      if (createRes.error_code !== ErrorCode.SUCCESS) {
        console.log(`Failed to create collection: ${createRes}`);
      }
      await this.client.createIndex({
        collection_name: this.collectionName,
        field_name: this.vectorField,
        extra_params: this.indexCreateParams,
      });
      console.log('======= MIGRATE MILVUS DONE =====');
    }
  }

  async findById(id: string) {
    const res = this.client.query({
      collection_name: this.collectionName,
      ids: [id],
    });
    return res?.[0];
  }

  async checkDocumentExist(docName: string) {
    const res = await this.client.query({
      collection_name: this.collectionName,
      expr: `docName == "${docName}"`,
    });
    return Boolean(res?.data?.length);
  }

  async deleteByIds(ids: string[] | number[]) {
    const res = await this.client.delete({
      collection_name: this.collectionName,
      ids: ids,
    });
    return res;
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

  async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
    if (vectors.length === 0) {
      return;
    }
    await this.ensureCollection(vectors, documents);
    if (this.partitionName !== undefined) {
      await this.ensurePartition();
    }

    const insertDatas: any[] = [];
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vectors.length; index++) {
      const vec = vectors[index];
      const doc = documents[index];
      const data: any = {
        [this.textField]: doc.pageContent,
        [this.vectorField]: vec,
      };
      this.fields.forEach((field) => {
        switch (field) {
          case this.primaryField:
            if (!this.autoId) {
              if (doc.metadata[this.primaryField] === undefined) {
                throw new Error(
                  `The Collection's primaryField is configured with autoId=false, thus its value must be provided through metadata.`,
                );
              }
              data[field] = doc.metadata[this.primaryField];
            }
            break;
          case this.textField:
            data[field] = doc.pageContent;
            break;
          case this.vectorField:
            data[field] = vec;
            break;
          default: // metadata fields
            if (doc.metadata[field] === undefined) {
              // NOTE: modify to feed not null metadata
              // throw new Error(
              //   `The field "${field}" is not provided in documents[${index}].metadata.`,
              // );
              data[field] = '';
            } else if (typeof doc.metadata[field] === 'object') {
              data[field] = JSON.stringify(doc.metadata[field]);
            } else {
              data[field] = doc.metadata[field];
            }
            break;
        }
      });

      insertDatas.push(data);
    }

    const params: any = {
      collection_name: this.collectionName,
      fields_data: insertDatas,
    };
    if (this.partitionName !== undefined) {
      params.partition_name = this.partitionName;
    }
    const insertResp = await this.client.insert(params);
    if (insertResp.status.error_code !== ErrorCode.SUCCESS) {
      throw new Error(`Error inserting data: ${JSON.stringify(insertResp)}`);
    }
    await this.client.flushSync({ collection_names: [this.collectionName] });
  }

  // async updateOrdVector(filter: any = {}, docs: any) { }

  async queryOrmVector(
    q: string,
    limit: number = 10,
    filter?: string,
    isExactPoint: boolean = false,
  ): Promise<Document[]> {
    try {
      const vector = await this.embeddingModel.embedQuery(q);
      const results = await this.similaritySearchVectorWithScore(
        vector,
        limit,
        filter,
      );
      const data = results.map(([doc, distance]) => {
        return isExactPoint ? { ...doc, distance } : doc;
      });
      return data;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async deleteOrmVector(filter?: string) {
    const queryOrmVector = await this.queryOrmVector('', 1000, filter);
    console.log('queryOrmVector', queryOrmVector);
    queryOrmVector.length > 0 &&
      this.deleteByIds(queryOrmVector.map((doc) => doc?.metadata?.id)).then();
  }

  async deleteByFilter(filter?: string) {
    return await this.client.deleteEntities({
      collection_name: this.collectionName,
      expr: filter,
    });
  }
  async updateOrdVector(filter?: string, docs?: any) {
    await this.deleteByFilter(filter);
    await this.ormAddDocuments(docs);
    console.log('[updateOrdVector] [UPDATE] [SUCCESS]', filter);
  }
}
