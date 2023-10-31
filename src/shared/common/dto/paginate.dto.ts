import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import {
  PAGINATION_TAKEN,
  MAX_PAGINATION_TAKEN,
  MIN_PAGINATION_TAKEN,
} from '@/shared/constants/constants';
import { IPaginate } from '../common.interface';

export class PaginateDto implements IPaginate {
  @ApiPropertyOptional({
    name: 'take',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Max(MAX_PAGINATION_TAKEN)
  @Min(MIN_PAGINATION_TAKEN)
  take?: number = PAGINATION_TAKEN;

  @ApiPropertyOptional({
    name: 'page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}
