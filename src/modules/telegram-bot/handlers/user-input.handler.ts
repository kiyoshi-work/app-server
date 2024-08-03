import { Inject, Injectable } from '@nestjs/common';
import { TelegramBot } from '@/telegram-bot/telegram-bot';
import { Handler } from '@/telegram-bot/handlers/handler';
import { ChatId } from 'node-telegram-bot-api';
import { EUserAction } from '@/telegram-bot/constants';
import { TermsConfirmation } from '@/telegram-bot/ui/pages';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserInputHandler implements Handler {
  @Inject(TelegramBot)
  private readonly bot: TelegramBot;

  @Inject(I18nService)
  private i18n: I18nService;

  inputSignatureCode = async (data: {
    chatId: ChatId;
    telegramId: string;
    code: string;
  }) => {
    try {
      // TODO: check verify valid here
      const verify = true;
      // await this.userService.getUserByReferralCode(data.code);

      if (verify) {
        const state = await this.bot.getState(data.chatId.toString());
        await this.bot.sendPageMessage(
          data.chatId,
          new TermsConfirmation(this.i18n, state.language_code).build(),
        );
        this.bot.setUserAction(
          data.chatId.toString(),
          EUserAction.WAITING_TERM_CONFIRMATION,
        );
      } else {
        const state = await this.bot.getState(data.chatId.toString());
        const text = this.i18n.t('handler.user_input.invalid', {
          lang: state.language_code,
        });
        await this.bot.sendMessage(data.chatId, text, { parse_mode: 'HTML' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  handler = async (data: {
    chatId: ChatId;
    telegramId: string;
    messageId: number;
    text: string;
    reply_to_message_id: number;
  }) => {
    try {
      const state = await this.bot.getState(data.chatId.toString());
      if (
        state.user_action === EUserAction.INPUT_INVITATION_CODE_STATUS &&
        data.reply_to_message_id
      ) {
        await this.inputSignatureCode({
          chatId: data.chatId,
          telegramId: data.telegramId,
          code: data.text,
        });
      } else {
        await this.bot.setState(data.chatId.toString(), {
          ...state,
          user_action: EUserAction.DEFAULT,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };
}
