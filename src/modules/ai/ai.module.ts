import { Module, OnApplicationBootstrap, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { AiService } from './services/ai.service';
import { WebsocketModule } from '@/websocket';
// import { EveVectorStoreService } from '@/ai/services/vector-store.service';
import { DatabaseModule } from '@/database';
import { configAI } from './configs/ai';
import { AiService } from './services/ai.service';
import { TestTool } from './tools/test.tool';
import { SwapTokenTool } from './tools/swap-token-tool';
import { EAIModel } from '@/shared/constants/enums';

const tools = [TestTool, SwapTokenTool];
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
    private swapTokenTool: SwapTokenTool,
  ) { }

  async onApplicationBootstrap() {
    // NOTE: test clone
    // const t = this.testTool.clone(11);
    // // t.setConfig(11);
    // this.testTool.setConfig(10);
    // console.log(
    //   '🚀 ~ AiModule ~ onApplicationBootstrap ~ t.getConfig():',
    //   t.getConfig(),
    // );
    // console.log(
    //   '🚀 ~ AiModule ~ onApplicationBootstrap ~ this.testTool:',
    //   this.testTool.getConfig(),
    // );

    // NOTE: Test agent
    const tools = [this.testTool.clone('ss'), this.swapTokenTool.clone()];
    // const tools = [new TestTool(), new SwapTokenTool()];
    const instruction = `
    #Who you are
You are Intent.Trade, your role is to facilitate cryptocurrency trading and on-chain interactions within the Solana network, such as:
- swap/buy
- transfer
#What you can do
Customer journey of a blockchain user usually follows these 4 following steps:
1. Acknowledge: Understand a project/token exists. User might acknowledge through news, best/worst token, references...
2. Do your own research (DYOR): user will search for everything of a project info including but not limited to: project info, product features, token name, price, communication channel (Discord, Telegram, Twitter...), team, backer
3. Buy: user will buy if he is interested with the token, with the pre-condition he has enough balance on his wallet.
4. Earn interest: besides profit from token increasing in price, user will earn more profit through staking/liquidity provision/lending
    `;
    // 'give me user info of user hung',

    const question = 'swap me 1 sol to whales';
    // await this.aiService.handleStreamAPI({
    //   question: `
    //   \n Instruction: ${instruction} \n
    //   \n Question: ${question} \n
    // `,
    //   modelName: EAIModel.GPT3_5_TURBO_0125,
    // });
  }
}
