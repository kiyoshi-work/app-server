import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddSegmentDTO, GetSegmentDTO } from '../dtos/segment.dto';
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

  @Post()
  async addNotiSegment(@Body() body: AddSegmentDTO) {
    const res = await this.segmentService.addNotiSegment(body);
    return {
      statusCode: HttpStatus.OK,
      data: res,
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
