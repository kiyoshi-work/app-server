import { UserRepository } from '@/database/repositories';
import { Inject, Injectable } from '@nestjs/common';
import { Tool } from 'langchain/tools';
import * as z from 'zod';
import { BaseTool } from './base.tool';

@Injectable()
export class TestTool extends BaseTool {
  @Inject(UserRepository)
  private readonly userRepository: UserRepository;

  // NOTE: defined type of config here
  public clone(config?: any): this {
    return super.clone(config);
  }

  name = 'get_user_info';
  description = `Get user info, including: id, address, user_name`;

  nameToken = '';

  instruction = `
  Instructions on how to use the get_user_info tool
  1.Using the Tool:
  get_user_info is used when users ask for user info
  `;

  getInstruction() {
    return this.instruction;
  }

  schema = z.object({
    username: z.string().describe('The usernames of the user'),
  }) as any;

  async _call(input: any) {
    console.log('=====> input', input);
    const other = typeof input.ids === 'string' ? input.ids : '';
    const user = await this.userRepository.findOne({
      where: { username: input?.user_name },
    });
    console.log('🚀 ~ TestTool ~ _call ~ user:', user);
    return JSON.stringify(user);
    // return '';
  }
}
