import { ChatId } from 'node-telegram-bot-api';
import { Inject, Injectable } from '@nestjs/common';
import { TelegramBot } from '@/telegram-bot/telegram-bot';
import { Handler } from './handler';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class StartHandler implements Handler {
  @Inject(TelegramBot)
  private readonly bot: TelegramBot;

  @Inject(I18nService)
  private readonly i18n: I18nService;

  handler = async (data: {
    chatId: ChatId;
    telegramId: string;
    firstName: string;
  }) => {
    await this.bot.sendMessage(data.chatId, this.i18n.t('start.xinchao', { lang: 'en' }));
  };
}
