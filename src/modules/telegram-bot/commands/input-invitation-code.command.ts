// src/modules/telegram/commands/start.command.ts
import { Inject, Injectable } from '@nestjs/common';
import { Command } from './interfaces/command.interface';
import { TelegramBot } from '../telegram-bot';
import { CommandData } from './interfaces/command-data.interface';
import { SessionState } from '../constants/session-states';
import { SessionService } from '../services/session.service';
import { TermsConfirmation } from '../ui/pages';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class InputInvitationCodeCommand implements Command {
  constructor(
    private readonly bot: TelegramBot,
    private readonly sessionService: SessionService,
  ) {}
  @Inject(I18nService)
  private readonly i18n: I18nService;

  canHandle(data: CommandData): boolean {
    return (
      data.session &&
      data.session.state === SessionState.INPUT_INVITATION_CODE_STATUS
    );
  }

  async execute(data: CommandData): Promise<void> {
    try {
      // TODO: check verify valid here
      const verify = true;
      // await this.userService.getUserByReferralCode(data.code);
      const state = await this.sessionService.getSession(
        data.chatId.toString(),
      );
      if (verify) {
        await this.bot.sendPageMessage(
          data.chatId,
          new TermsConfirmation(this.i18n, state?.data?.language_code).build(),
        );
      } else {
        const text = this.i18n.t('handler.user_input.invalid', {
          lang: state?.data?.language_code,
        });
        await this.bot.sendMessage(data.chatId, text, { parse_mode: 'HTML' });
      }
      this.sessionService.clearSession(data.chatId.toString());
    } catch (error) {
      console.error(error);
    }
  }
}
