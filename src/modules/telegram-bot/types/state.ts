import { EUserAction } from '../constants';

export type TelegramBotState = {
  language_code: string;
  updated_at?: number;
  user_action?: EUserAction;
  buy_order_message_id?: number;
};
