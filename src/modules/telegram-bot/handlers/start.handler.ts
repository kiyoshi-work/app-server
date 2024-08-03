import { ChatId } from 'node-telegram-bot-api';
import { Inject, Injectable } from '@nestjs/common';
import { TelegramBot } from '@/telegram-bot/telegram-bot';
import { Handler } from './handler';
import { I18nService } from 'nestjs-i18n';
import { EUserAction } from '../constants';
import { MainPage, TermsConfirmation, WelcomePage } from '../ui/pages';

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
    text: string;
  }) => {
    console.log('START FROM : --> ', data.telegramId, ':', data.chatId);
    // TODO: check existed user to start flow
    const existedUser = false;
    if (existedUser) {
      await this.bot.sendPageMessage(
        data.chatId,
        new MainPage(this.i18n).build(),
      );
    } else {
      const referralCode = data?.text?.split('/start ')[1];
      const state = await this.bot.getState(data.chatId.toString());
      if (referralCode) {
        const verify = true;
        if (verify) {
          const text = this.i18n.t('start.verified', {
            lang: state.language_code,
          });
          await this.bot.sendMessage(data.chatId, text, { parse_mode: 'HTML' });

          await this.bot.sendPageMessage(
            data.chatId,
            new TermsConfirmation(this.i18n, state.language_code).build(),
          );
          this.bot.setUserAction(
            data.chatId.toString(),
            EUserAction.WAITING_TERM_CONFIRMATION,
          );
          return;
        }
      }
      await this.bot.sendPagePhoto(
        data.chatId,
        new WelcomePage(this.i18n, state.language_code).build({
          firstName: data.firstName,
        }),
      );
    }
  };
}
