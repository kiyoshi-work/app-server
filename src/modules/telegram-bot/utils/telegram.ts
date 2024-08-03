import { CallbackQuery, Message } from 'node-telegram-bot-api';

export const parserMessageTelegram = (msg: Message) => ({
  messageId: msg.message_id,
  chatId: msg.chat.id,
  telegramId: msg.from.id,
  firstName: msg.from.first_name,
  text: msg.text,
  isInputMessage: !msg?.entities,
  reply_to_message_id: msg?.reply_to_message?.message_id,
});

export const parserCallbackMessageTelegram = (query: CallbackQuery) => ({
  messageId: query.message.message_id,
  chatId: query.message.chat.id,
  telegramId: query.from.id,
  firstName: query.from.first_name,
});

export const parseCommand = (
  url: string,
): { cmd: string; params: Record<string, any> } => {
  const [cmd, query] = url.split('::');
  const params = {};
  if (query) {
    query.split('&').forEach(function (part) {
      const item = part.split('=');
      params[item[0]] = decodeURIComponent(item[1]);
    });
  }
  return { cmd, params };
};
