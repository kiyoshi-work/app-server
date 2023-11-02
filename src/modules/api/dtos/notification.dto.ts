import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginateDto } from '@/shared/common/dto/paginate.dto';

export class PushNotificationDto {
  @ApiProperty()
  @IsUUID()
  client_id: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  launch_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    return [true, 'enabled', 'true', '1', 1].indexOf(value) > -1;
  })
  @IsBoolean()
  is_logged_db?: boolean;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  @ApiProperty({
    example: ['2'],
  })
  recipients: string[];

  @ApiPropertyOptional({
    example: 'system',
  })
  @IsString()
  @IsOptional()
  type?: string;
}

export class PushNotificationAllDto {
  @ApiProperty()
  @IsUUID()
  client_id: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  launch_url?: string;

  @ApiPropertyOptional({
    example: 'system',
  })
  @IsString()
  @IsOptional()
  type?: string;
}

export class GetNotificationDTO extends PaginateDto {
  @ApiProperty()
  @IsUUID()
  client_id: string;

  @ApiProperty()
  @IsString()
  recipient_id: string;

  @ApiPropertyOptional({
    example: 'system',
  })
  @IsString()
  @IsOptional()
  type?: string;
}
