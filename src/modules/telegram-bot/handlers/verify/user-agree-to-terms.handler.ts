import { ChatId } from 'node-telegram-bot-api';
import { Inject, Injectable } from '@nestjs/common';
import { TelegramBot } from '@/telegram-bot/telegram-bot';
import { Handler } from '@/telegram-bot/handlers/handler';
import { EUserAction } from '@/telegram-bot/constants';
import { MainPage } from '@/telegram-bot/ui/pages';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserAgreeToTermsHandlers implements Handler {
  @Inject(TelegramBot)
  private readonly bot: TelegramBot;

  @Inject(I18nService)
  private readonly i18n: I18nService;

  handler = async (data: { chatId: ChatId; telegramId: string }) => {
    if (
      (await this.bot.getState(data.chatId.toString(), true)).user_action ===
      EUserAction.WAITING_TERM_CONFIRMATION
    ) {
      const state = await this.bot.getState(data.chatId.toString());

      await this.bot.sendPageMessage(
        data.chatId,
        new MainPage(this.i18n, state.language_code).build(),
      );
      await this.bot.setUserAction(data.chatId.toString(), EUserAction.DEFAULT);
    }
  };
}
