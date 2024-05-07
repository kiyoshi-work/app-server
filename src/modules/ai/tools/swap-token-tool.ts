import * as z from 'zod';
import { BaseTool } from './base.tool';
export class SwapTokenTool extends BaseTool {
  name = 'swap_token';
  description =
    'Useful when need to buy/sell/swap. You must call get-portfolio-tool function to get exact user balance and calculating before swap.';
  question = '';
  schema = z.object({
    threadId: z.any().optional().describe('The thread id of user'),
    outputTokenAddress: z
      .string()
      .optional()
      .describe('The output token address'),
    inputTokenAmount: z
      .number()
      .nullable()
      .optional()
      .describe('The input token amount'),
    outputTokenAmount: z
      .number()
      .nullable()
      .optional()
      .describe('The output token amount'),
    inputTokenSymbol: z
      .string()
      .optional()
      .describe('The input token symbol and Dont modify the original version'),
    outputTokenSymbol: z
      .string()
      .optional()
      .describe(
        'The output token symbol. Default is empty string and Dont modify the original version',
      ),
    slippage: z.string().optional().describe('The slippage to swap (percent)'),
  });

  public clone(config?: any): this {
    return super.clone(config);
  }
  public findTokenAvailableInBalance(token_symbol, balances: any) {
    return balances.filter((a) => a.symbol === token_symbol);
  }

  async _call(input: any) {
    console.log('🚀 ~ SwapTokenTool ~ _call ~ input:', input);
    return '';
  }
}
