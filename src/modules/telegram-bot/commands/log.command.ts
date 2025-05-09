// src/modules/telegram/commands/log.command.ts
import { Inject, Injectable } from '@nestjs/common';
import { Command } from './interfaces/command.interface';
import { TelegramBot } from '../telegram-bot';
import { CommandData } from './interfaces/command-data.interface';
import { SessionService } from '../services/session.service';
// import { RequireWallet } from '@/shared/decorators/require-wallet.decorator';
@Injectable()
export class LogCommand implements Command {
  constructor(
    private readonly bot: TelegramBot,
    private readonly sessionService: SessionService,
  ) {}

  canHandle(data: CommandData): boolean {
    return data.text === '/log';
  }

  // @RequireWallet()
  async execute(data: CommandData): Promise<void> {
    try {
      // Get current session for this chat
      const currentSession = await this.sessionService.getSession(data.chatId);

      // Format session data for display
      let logMessage = '📊 *Current Session State*\n\n';

      if (!currentSession) {
        logMessage += 'No active session found.';
      } else {
        logMessage += `*State*: \`${currentSession.state}\`\n\n`;
        logMessage += '*Session Data*:\n```json\n';
        logMessage += JSON.stringify(currentSession.data, null, 2);
        logMessage += '\n```';
      }

      // Add system info
      logMessage += '\n\n*System Info*:';
      logMessage += `\nTimestamp: ${new Date().toISOString()}`;
      logMessage += `\nChat ID: ${data.chatId}`;
      logMessage += `\nUser ID: ${data.telegramId}`;

      // Get account balance

      // Add message ID if available
      if (currentSession?.messageId) {
        logMessage += `\n\nMessage ID: \`${currentSession.messageId}\``;
      }

      // Send formatted log message
      await this.bot.sendMessage(data.chatId, logMessage, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Error in LogCommand:', error);
      await this.bot.sendMessage(
        data.chatId,
        `Error in LogCommand: ${error.message}`,
        {
          parse_mode: 'Markdown',
        },
      );
    }
  }
}
