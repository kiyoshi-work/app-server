import { ChatId } from 'node-telegram-bot-api';
import { Inject, Injectable } from '@nestjs/common';
import { TelegramBot } from '@/telegram-bot/telegram-bot';
import { Handler } from '@/telegram-bot/handlers/handler';
import { MainPage } from '@/telegram-bot/ui/pages';
import { I18nService } from 'nestjs-i18n';
import { SessionService } from '@/telegram-bot/services/session.service';
@Injectable()
export class UserAgreeToTermsHandlers implements Handler {
  @Inject(TelegramBot)
  private readonly bot: TelegramBot;

  @Inject(I18nService)
  private readonly i18n: I18nService;

  @Inject(SessionService)
  private readonly sessionService: SessionService;

  handler = async (data: { chatId: ChatId; telegramId: string }) => {
    const state = await this.sessionService.getSession(data.chatId.toString());

    await this.bot.sendPageMessage(
      data.chatId,
      new MainPage(this.i18n, state?.data?.language_code).build(),
    );
  };
}
