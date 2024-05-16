import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssistantDTO {
  @ApiProperty({ required: true })
  question: string;

  // @ApiProperty({ required: true })
  // @IsUUID()
  // thread_id: string;
}
