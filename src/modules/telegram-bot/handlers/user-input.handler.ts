import { Inject, Injectable } from '@nestjs/common';
import { TelegramBot } from '@/telegram-bot/telegram-bot';
import { Handler } from '@/telegram-bot/handlers/handler';
import { ChatId } from 'node-telegram-bot-api';
import { I18nService } from 'nestjs-i18n';
import { CommandChain } from '../commands/command-chain';
import { SessionData, SessionService } from '../services/session.service';
import { SessionState } from '../constants/session-states';
import { cloneDeep } from '@/shared/utils';

@Injectable()
export class UserInputHandler implements Handler {
  @Inject(TelegramBot)
  private readonly bot: TelegramBot;

  @Inject(I18nService)
  private i18n: I18nService;

  @Inject(SessionService)
  private readonly sessionService: SessionService;

  @Inject(CommandChain)
  private readonly commandChain: CommandChain;

  handler = async (data: {
    chatId: ChatId;
    telegramId: string;
    messageId: number;
    text: string;
    reply_to_message_id: number;
  }) => {
    try {
      const originalSession: SessionData = await this.sessionService.getSession(
        data.chatId,
      );
      const sessionCopy = originalSession
        ? cloneDeep(originalSession)
        : {
            state: SessionState.NONE,
            data: {},
            message: '',
            messageId: 0,
            expires: new Date(),
          };
      // Always execute commands to ensure all messages get processed
      await this.commandChain.execute({
        ...data,
        session: sessionCopy,
        reply_to_message_id: data.reply_to_message_id || 0,
      });
    } catch (error) {
      console.error(error);
    }
  };
}
