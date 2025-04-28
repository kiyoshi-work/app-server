import { Inject, Injectable } from '@nestjs/common';
import { SessionState } from '../constants/session-states';
import Redis from 'ioredis';

export type SessionDataType = {
  language_code?: string;
  address?: string;
  subscriptionId?: string;
};

export interface SessionData {
  state: SessionState;
  data: SessionDataType;
  expires: Date;
  updated_at: number;
  message?: string;
  messageId?: number | string;
}

@Injectable()
export class SessionService {
  private readonly SESSION_TTL = 60 * 60;
  @Inject('TELEGRAM_BOT_STATE')
  private botStateStore: Redis;

  async getSession(chatId: number | string): Promise<SessionData | undefined> {
    const key = chatId.toString();
    const session = (await this.botStateStore.hgetall(
      'telegram_bot_state:chat:' + key,
    )) as any;
    if (Object.keys(session).length > 0) {
      // Parse the data JSON string back to an object
      if (session.data && typeof session.data === 'string') {
        try {
          session.data = JSON.parse(session.data);
        } catch (e) {
          session.data = {};
        }
      }
      return session as SessionData;
    }

    return undefined;
  }

  async setState(
    chatId: number | string,
    state?: SessionState,
    data?: Record<string, any>,
    message?: string,
    messageId?: number | string,
  ): Promise<SessionData> {
    const key = chatId.toString();
    const redisKey = 'telegram_bot_state:chat:' + key;
    const expires = new Date(Date.now() + this.SESSION_TTL);
    const session = await this.getSession(chatId);
    const newData = {
      ...session?.data,
      ...data,
    };
    const newSession = {
      ...session,
      data: newData,
    };
    const newState = state || session?.state || SessionState.NONE;
    this.setState(
      chatId,
      newState,
      newData,
      session?.message,
      session?.messageId,
    );
    await this.botStateStore
      .multi()
      .hset(redisKey, {
        state,
        data: JSON.stringify(newSession), // Serialize data to JSON string
        expires,
        message,
        messageId,
        updated_at: Date.now(),
      })
      .expire(redisKey, Math.floor(this.SESSION_TTL))
      .exec();
    return newSession;
  }

  clearSession(chatId: number | string): void {
    const key = chatId.toString();
    this.botStateStore.del('telegram_bot_state:chat:' + key);
  }
}
