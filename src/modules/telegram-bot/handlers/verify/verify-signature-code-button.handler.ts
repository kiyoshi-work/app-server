import { ChatId } from 'node-telegram-bot-api';
import { Inject, Injectable } from '@nestjs/common';
import { TelegramBot } from '@/telegram-bot/telegram-bot';
import { Handler } from '@/telegram-bot/handlers/handler';
import { EUserAction } from '@/telegram-bot/constants';
import { I18nService } from 'nestjs-i18n';
import { EParseMode } from '../../utils/message';

@Injectable()
export class VerifySignatureCodeButtonHandler implements Handler {
  @Inject(TelegramBot)
  private readonly bot: TelegramBot;

  @Inject(I18nService)
  private readonly i18n: I18nService;

  handler = async (data: { chatId: ChatId; telegramId: string }) => {
    console.log('clickVerifySignatureCodeButton:', data);
    const state = await this.bot.getState(data.chatId.toString());
    const text = this.i18n.t('start.verify.verify_signature_code_button', {
      lang: state.language_code,
    });
    await this.bot.sendMessage(data.chatId, text, {
      parse_mode: EParseMode.HTML,
      disable_web_page_preview: true,
      reply_markup: { force_reply: true },
    });
    await this.bot.setUserAction(
      data.chatId.toString(),
      EUserAction.INPUT_INVITATION_CODE_STATUS,
    );
  };
}
