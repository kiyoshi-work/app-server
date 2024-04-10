import { Module, OnApplicationBootstrap, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { AiService } from './services/ai.service';
import { WebsocketModule } from '@/websocket';
// import { EveVectorStoreService } from '@/ai/services/vector-store.service';
import { DatabaseModule } from '@/database';
import { configAI } from './configs/ai';
import { AiService } from './services/ai.service';
import { TestTool } from './tools/test.tool';

const tools = [TestTool];
@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configAI],
    }),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [],
  // @ts-ignore
  providers: [AiService, ...tools],
  exports: [AiService, ...tools],
})
export class AiModule implements OnApplicationBootstrap {
  constructor(
    private aiService: AiService,
    private testTool: TestTool,
  ) { }

  async onApplicationBootstrap() {
    const tools = [
      this.testTool.clone("ss"),
    ];
    // const t = this.testTool.clone();
    // t.setConfig(11);
    // this.testTool.setConfig(10);
    // console.log("🚀 ~ AiModule ~ onApplicationBootstrap ~ t.getConfig():", t.getConfig(), t.getInstruction());
    // console.log("🚀 ~ AiModule ~ onApplicationBootstrap ~ this.testTool:", this.testTool.getConfig())

    // await this.aiService.streamAgent('give me user info of user hung', undefined, tools)
  }
}
