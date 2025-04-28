import TelegramBotApi, {
  ChatId,
  SendMessageOptions,
} from 'node-telegram-bot-api';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { COMMAND_KEYS, EUserAction } from '@/telegram-bot/constants';
import Redis from 'ioredis';
import {
  parseCommand,
  parserCallbackMessageTelegram,
  parserMessageTelegram,
} from './utils';
import { Handler } from '@/telegram-bot/handlers';
import { Menu, PageResponse, PhotoResponse, TelegramBotState } from './types';
import { QueueService } from '@/queue/queue.service';
import { SessionService } from './services/session.service';

export const MAX_TIME_STATE_OUT_DATE = 60 * 1000; //1 minute

@Injectable()
export class TelegramBot {
  public telegramIdStatus: Record<string, number> = {};

  private bot: TelegramBotApi;

  public handlers: Record<string, Handler>;

  @Inject('TELEGRAM_BOT_STATE')
  private botStateStore: Redis;

  @Inject(SessionService)
  private sessionService: SessionService;

  private state: Record<string, TelegramBotState>;

  constructor(
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
  ) {
    const token = this.configService.get<string>('telegram.token');
    const isBot = Boolean(Number(process.env.IS_BOT || 0));
    if (isBot) {
      //if use node v20 -->  {"code":"EFATAL","message":"EFATAL: AggregateError"}
      this.bot = new TelegramBotApi(token, {
        polling: true,
        // NOTE: prevent  {"code":"EFATAL","message":"EFATAL: AggregateError"}
        request: {
          url: '',
          agentOptions: {
            keepAlive: true,
            family: 4,
          },
        },
      });
    } else {
      this.bot = new TelegramBotApi(token, { polling: false });
    }
    this.bot.getMe().then((bot) => console.log('---- BOT INFO: ----', bot));
    this.bot.on('polling_error', (msg) => console.log(msg));
    this.state = {};
  }

  async sendPageMessage(chatId: ChatId, data: PageResponse) {
    try {
      return await this.bot.sendMessage(chatId, data.text, data.menu);
    } catch (error) {
      console.log('[sendPageMessage] [error]', error);
    }
  }

  async sendPagePhoto(chatId: ChatId, data: PhotoResponse) {
    try {
      return await this.bot.sendPhoto(chatId, data.photo, data.menu);
    } catch (error) {
      console.log('[sendPagePhoto] [error]', error);
    }
  }

  async editMessageReplyMarkup(
    newButton: {
      inline_keyboard: Menu[][];
    },
    chat_id: ChatId,
    message_id: number,
  ) {
    try {
      await this.bot.editMessageReplyMarkup(newButton, {
        chat_id,
        message_id,
      });
    } catch (error) {
      console.log('🚀 ~ file: telegram-bot.ts:103 ~ error:', error);
    }
  }
  async setUserAction(chatId: string, userAction: EUserAction) {
    const currState = (await this.botStateStore.hgetall(
      'telegram_bot_state:chat:' + chatId,
    )) as any;
    this.state[chatId] = {
      ...currState,
      user_action: userAction,
    };
    await this.botStateStore.hset(
      'telegram_bot_state:chat:' + chatId,
      this.state[chatId],
    );
  }

  async deleteMessage(chatId: ChatId, messageId: number, seconds = 0) {
    const timeout = setTimeout(async () => {
      try {
        await this.bot.deleteMessage(chatId, messageId);
      } catch (error) {
        console.log(
          '🚀 ~ file: telegram-bot.ts:93 ~ TelegramBot ~ timeout ~ error:',
          error,
        );
      }
      clearTimeout(timeout);
    }, seconds * 1000);
  }

  async sendMessage(
    chatId: ChatId,
    text: string,
    options?: SendMessageOptions,
  ) {
    try {
      return await this.bot.sendMessage(chatId, text, options);
    } catch (error) {
      console.log('[sendMessage] [error]', error);
    }
  }

  userReply(callback: any) {
    this.bot.on('message', (msg) => {
      callback(parserMessageTelegram(msg));
    });
  }

  setupMenuCallback(callback: any) {
    this.bot.on('callback_query', async (query) => {
      const { data: action } = query;
      const data = parserCallbackMessageTelegram(query);
      const chatId = data.chatId.toString();
      const session = await this.sessionService.getSession(chatId);
      if (session?.data?.language_code != query.from?.language_code) {
        this.sessionService.setState(data.chatId.toString(), undefined, {
          language_code: query.from.language_code,
        });
      }
      callback(action, data);
    });
  }

  registerHandlers(handlers: Record<string, Handler>) {
    this.handlers = handlers;
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
    this.userReply((data) => {
      return this.queueService.addCommandToQueue(
        COMMAND_KEYS.USER_INPUT,
        undefined,
        data,
      );
    });
    this.setupMenuCallback((cmd, data) => {
      console.log('🚀 ~ REQUEST COMMAND:', { cmd });
      const { cmd: _cmd, params } = parseCommand(cmd);
      console.log(
        '🚀 ~ file: telegram-bot.ts:257 ~ TelegramBot ~ this.setupMenuCallback ~ params:',
        params,
      );
      return this.queueService.addCommandToQueue(_cmd, params, data);
      // const handler = this.handlers[_cmd];
      // if (handler) {
      //   if (params && (handler as any)?.setConfig) {
      //     (handler as any).setConfig(params);
      //   }
      //   handler
      //     .handler(data)
      //     .then()
      //     .catch((e) => {
      //       console.error(e, {
      //         file: 'TelegramBot.start',
      //         text: `handler command ${_cmd} error: `,
      //       });
      //     });
      // } else {
      //   console.log('unknown callback:', { _cmd });
      // }
    });
  }
}
