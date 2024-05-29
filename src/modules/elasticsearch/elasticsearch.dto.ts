import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class ESExampleDataIndex {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  name: string;
}
export const ELASTICSEARCH_INDEX = {
  EXAMPLE_BY_ID: 'example_id_',
};

export class ElasticSearchFilter {
  @IsOptional()
  @IsString()
  search_text?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number;
}
