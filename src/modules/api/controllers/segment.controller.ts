import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetSegmentDTO } from '../dtos/segment.dto';
import { SegmentService } from '../services/segment.service';

@ApiTags('Segment')
@Controller('/segment')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  @Get()
  async getNotiSegment(@Query() query: GetSegmentDTO) {
    const result = await this.segmentService.getNotiSegment(query);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Put('/:segment_id/switch')
  async switchSegment(
    @Param('segment_id', ParseUUIDPipe) segmentId: string,
    @Body() query: GetSegmentDTO,
  ) {
    const res = await this.segmentService.switchSegment(segmentId, query);
    return {
      statusCode: HttpStatus.OK,
      data: res,
    };
  }
}
