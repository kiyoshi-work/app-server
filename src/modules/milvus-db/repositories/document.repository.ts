import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Inject } from '@nestjs/common';
import { MilvusClient, ErrorCode } from '@zilliz/milvus2-sdk-node';
import { Milvus } from 'langchain/vectorstores/milvus';
import { Document } from '@langchain/core/documents';

export class MilvusDocumentRepository extends Milvus {
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
      vectorField: 'embbedding',
      textField: 'pageContent',
      url: `${configService.get('milvus.db.host')}:${configService.get('milvus.db.port')}`,
    });
    console.log(
      "🚀 ~ MilvusDocumentRepository ~ `${configService.get('milvus.db.host')}:${configService.get('milvus.db.port')}`:",
      `${configService.get('milvus.db.host')}:${configService.get('milvus.db.port')}`,
    );
    this.collectionName = collectionName;
  }

  async onModuleInit() {
    // await this.ensureCollection();
  }

  // async createCollection(): Promise<void> {
  //   const fieldList: FieldType[] = [];

  //   // fieldList.push(...createFieldTypeForMetadata(documents, this.primaryField));

  //   fieldList.push(
  //     {
  //       name: this.primaryField,
  //       description: 'Primary key',
  //       data_type: DataType.Int64,
  //       is_primary_key: true,
  //       autoID: this.autoId,
  //     },
  //     {
  //       name: this.textField,
  //       description: 'Text field',
  //       data_type: DataType.VarChar,
  //       type_params: {
  //         max_length: 2000,
  //         //   this.textFieldMaxLength > 0
  //         //     ? this.textFieldMaxLength.toString()
  //         //     : getTextFieldMaxLength(documents).toString(),
  //       },
  //     },
  //     {
  //       name: this.vectorField,
  //       description: 'Vector field',
  //       data_type: DataType.FloatVector,
  //       type_params: {
  //         // dim: getVectorFieldDim(vectors).toString(),
  //         dim: '3072',
  //       },
  //     },
  //     {
  //       name: 'docName',
  //       description: 'docName',
  //       data_type: DataType.VarChar,
  //       type_params: {
  //         max_length: 200,
  //       },
  //     },
  //   );

  //   fieldList.forEach((field) => {
  //     if (!field.autoID) {
  //       this.fields.push(field.name);
  //     }
  //   });

  //   const createRes = await this.client.createCollection({
  //     collection_name: this.collectionName,
  //     fields: fieldList,
  //   });

  //   if (createRes.error_code !== ErrorCode.SUCCESS) {
  //     console.log(createRes);
  //     throw new Error(`Failed to create collection: ${ createRes }`);
  //   }

  //   await this.client.createIndex({
  //     collection_name: this.collectionName,
  //     field_name: this.vectorField,
  //     extra_params: this.indexCreateParams,
  //   });
  // }

  // async ensureCollection() {
  //   // TODO: write in migrate file
  //   try {
  //     // Check and create table and columns
  //     const hasColResp = await this.client.hasCollection({
  //       collection_name: this.collectionName,
  //     });
  //     if (hasColResp.status.error_code !== ErrorCode.SUCCESS) {
  //       throw new Error(
  //         `Error checking collection: ${ JSON.stringify(hasColResp, null, 2) }`,
  //       );
  //     }
  //     if (hasColResp.value === false) {
  //       await this.createCollection();
  //     } else {
  //       await this.grabCollectionFields();
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }

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
    filter?: any,
    isExactPoint: boolean = false,
  ) {
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
      return '';
    }
  }
}
