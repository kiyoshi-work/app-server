import { ChatId } from 'node-telegram-bot-api';
import { Inject, Injectable } from '@nestjs/common';
import { TelegramBot } from '@/telegram-bot/telegram-bot';
import { Handler } from '@/telegram-bot/handlers/handler';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserDisagreeToTermsHandlers implements Handler {
  @Inject(TelegramBot)
  private readonly bot: TelegramBot;

  @Inject(I18nService)
  private readonly i18n: I18nService;

  handler = async (data: {
    chatId: ChatId;
    telegramId: string;
    messageId: number;
  }) => {
    const state = await this.bot.getState(data.chatId.toString());

    await this.bot.sendMessage(
      data.chatId,
      this.i18n.t('start.verify.user_disagree_to_terms', {
        lang: state.language_code,
      }),
    );
    await this.bot.deleteMessage(data.chatId, data.messageId);
  };
}