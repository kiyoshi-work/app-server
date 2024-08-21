import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Response,
} from '@nestjs/common';
import { AssistantDTO } from '../dtos/assistant.dto';
import { AiService } from '@/ai/services/ai.service';
import { TJWTPayload } from '@/shared/types';
import { CurrentUser } from '@/shared/decorators/user.decorator';
import { EAIModel } from '@/shared/constants/enums';

@ApiTags('Assistant')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly aiService: AiService) {}

  @Post('conversation')
  @ApiOperation({ summary: 'conversation assistant' })
  @HttpCode(HttpStatus.OK)
  // @Permissions([`${AdminConfig.LIMIT_MESSAGE}`])
  // @ValidatePermission()
  async chatBot(
    @CurrentUser() user: TJWTPayload,
    @Body() body: AssistantDTO,
    @Response() res: any,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const callback = (data: any = {}) => {
      res.write(`${JSON.stringify(data)}\n\n\n`);
    };
    const data = {
      question: body?.question,
      modelName: EAIModel.GPT4_TURBO_2024_04_09,
    };

    await this.aiService.handleStreamAPI(data, callback);
    res.end();
  }
}
