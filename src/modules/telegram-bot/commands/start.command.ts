// src/modules/telegram/commands/start.command.ts
import { Inject, Injectable } from '@nestjs/common';
import { Command } from './interfaces/command.interface';
import { TelegramBot } from '../telegram-bot';
import { CommandData } from './interfaces/command-data.interface';
import { SessionService } from '../services/session.service';
import { WelcomePage } from '../ui/pages';
import { TermsConfirmation } from '../ui/pages';
import { I18nService } from 'nestjs-i18n';
import { MainPage } from '../ui/pages';

@Injectable()
export class StartCommand implements Command {
  constructor(
    private readonly bot: TelegramBot,
    private readonly sessionService: SessionService,
  ) {}
  @Inject(I18nService)
  private readonly i18n: I18nService;

  canHandle(data: CommandData): boolean {
    return data.text === '/start';
  }

  async execute(data: CommandData): Promise<void> {
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
      const state = await this.sessionService.getSession(
        data.chatId.toString(),
      );
      if (referralCode) {
        const verify = true;
        if (verify) {
          const text = this.i18n.t('start.verified', {
            lang: state?.data?.language_code,
          });
          await this.bot.sendMessage(data.chatId, text, { parse_mode: 'HTML' });

          await this.bot.sendPageMessage(
            data.chatId,
            new TermsConfirmation(
              this.i18n,
              state?.data?.language_code,
            ).build(),
          );
          return;
        }
      }
      await this.bot.sendPagePhoto(
        data.chatId,
        new WelcomePage(this.i18n, state?.data?.language_code).build({
          firstName: data.firstName,
        }),
      );
    }
  }
}
