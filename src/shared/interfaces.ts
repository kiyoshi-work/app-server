import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

export type TChatModelName =
  | 'gpt-3.5-turbo'
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-4o'
  | 'gpt-4o-mini';

export type TTextEmbeddingName =
  | 'text-embedding-3-small'
  | 'text-embedding-3-large';
export type TChatModel = Record<TChatModelName, ChatOpenAI>;
export type TTextEmbedding = Record<TTextEmbeddingName, OpenAIEmbeddings>;
