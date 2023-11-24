import TelegramBotApi, {
  ChatId,
  SendMessageOptions,
} from 'node-telegram-bot-api';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { COMMAND_KEYS } from '@/telegram-bot/constants';
import Redis from 'ioredis';
import { parserMessageTelegram } from './utils';
import { Handler } from '@/telegram-bot/handlers';

export type TelegramBotState = {
  language_code?: string;
  updated_at?: number;
  chain_id?: number;
};
export const MAX_TIME_STATE_OUT_DATE = 60 * 1000; //1 minute

@Injectable()
export class TelegramBot {
  public telegramIdStatus: Record<string, number> = {};

  private bot: TelegramBotApi;

  private handlers: Record<string, Handler>;

  @Inject('TELEGRAM_BOT_STATE')
  private botStateStore: Redis;

  private state: Record<string, TelegramBotState>;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('telegram.token');
    this.bot = new TelegramBotApi(token, { polling: true });
    this.state = {};
  }

  async sendMessage(
    chatId: ChatId,
    text: string,
    options?: SendMessageOptions,
  ) {
    try {
      return this.bot.sendMessage(chatId, text, options);
    } catch (error) {
      console.log('🚀 ~ file: telegram-bot.ts:89 ~ error:', error);
    }
  }

  setupStartCommand(callback: any) {
    this.bot.onText(/\/start/, (msg) => {
      callback(parserMessageTelegram(msg));
    });
  }

  userReply(callback: any) {
    this.bot.on('message', (msg) => {
      callback(parserMessageTelegram(msg));
    });
  }

  registerHandlers(handlers: Record<string, Handler>) {
    this.handlers = handlers;
  }

  async setState(telegramId: string, state: TelegramBotState) {
    const storageState = await this.getState(telegramId);
    state.updated_at = Date.now();
    this.state[telegramId] = { ...storageState, ...state };
    await this.botStateStore.hset(
      'telegram_bot_state:chat:' + telegramId,
      state,
    );
  }

  async getState(telegramId: string, isNow = false): Promise<TelegramBotState> {
    const state = this.state[telegramId];
    if (
      !state ||
      state.updated_at + MAX_TIME_STATE_OUT_DATE < Date.now() ||
      isNow
    ) {
      this.state[telegramId] = (await this.botStateStore.hgetall(
        'telegram_bot_state:chat:' + telegramId,
      )) as any;
    }
    return this.state[telegramId];
  }

  async initState() {
    const keys = await this.botStateStore.keys('telegram_bot_state:chat:*');
    if (keys.length > 0) {
      const values = await this.botStateStore.mget(keys);
      keys.forEach((value, index) => {
        const chatId = value.split('telegram_bot_state:chat:')[0];
        this.state[chatId] = values[0] as any;
      });
    }
  }
  async start() {
    const startHandler = this.handlers[COMMAND_KEYS.START];

    if (startHandler) {
      this.setupStartCommand(startHandler.handler);
    }
    // this.userReply(this.handlers[COMMAND_KEYS.USER_INPUT].handler);
  }
}
