import { ChatId } from 'node-telegram-bot-api';

export interface CommandData {
  chatId: ChatId;
  telegramId: string;
  messageId: number;
  text: string;
  reply_to_message_id: number;
  firstName?: string;
  session?: any;
  username?: string;
  message_thread_id?: number;
}
