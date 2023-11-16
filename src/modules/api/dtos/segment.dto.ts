import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class GetSegmentDTO {
  @ApiProperty()
  @IsUUID()
  client_id: string;

  @ApiProperty()
  @IsString()
  client_uid: string;
}

export class GetAllSegmentDTO {
  @ApiProperty()
  @IsUUID()
  client_id: string;
}

export class AddSegmentDTO {
  @ApiProperty()
  @IsUUID()
  client_id: string;

  @ApiProperty()
  @IsString()
  segment_cid: string;

  @ApiProperty()
  @IsString()
  name: string;
}
