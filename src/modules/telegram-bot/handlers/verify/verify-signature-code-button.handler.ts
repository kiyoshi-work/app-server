import { ChatId } from 'node-telegram-bot-api';
import { Inject, Injectable } from '@nestjs/common';
import { TelegramBot } from '@/telegram-bot/telegram-bot';
import { Handler } from '@/telegram-bot/handlers/handler';
import { I18nService } from 'nestjs-i18n';
import { EParseMode } from '../../utils/message';
import { SessionService } from '../../services/session.service';
import { SessionState } from '../../constants/session-states';

@Injectable()
export class VerifySignatureCodeButtonHandler implements Handler {
  @Inject(TelegramBot)
  private readonly bot: TelegramBot;

  @Inject(I18nService)
  private readonly i18n: I18nService;

  @Inject(SessionService)
  private readonly sessionService: SessionService;

  handler = async (data: { chatId: ChatId; telegramId: string }) => {
    console.log('clickVerifySignatureCodeButton:', data);
    const state = await this.sessionService.getSession(data.chatId.toString());
    const text = this.i18n.t('start.verify.verify_signature_code_button', {
      lang: state?.data?.language_code,
    });
    await this.bot.sendMessage(data.chatId, text, {
      parse_mode: EParseMode.HTML,
      disable_web_page_preview: true,
      reply_markup: { force_reply: true, selective: true },
    });
    await this.sessionService.setState(
      data.chatId.toString(),
      SessionState.INPUT_INVITATION_CODE_STATUS,
    );
  };
}
