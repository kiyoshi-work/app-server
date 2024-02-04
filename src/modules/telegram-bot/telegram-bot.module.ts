import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TelegramBot } from '@/telegram-bot/telegram-bot';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configTelegram } from '@/telegram-bot/configs/telegram';
import { DatabaseModule } from '@/database';
import Redis from 'ioredis';
import { HandlerService } from '@/telegram-bot/services/handler.service';
import { ComingSoonHandler, StartHandler } from '@/telegram-bot/handlers';
import { BlockchainModule } from '@/blockchain';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

const handlers = [HandlerService, StartHandler, ComingSoonHandler];

@Module({
  imports: [
    DatabaseModule,
    BlockchainModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configTelegram],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../../i18n/telebot'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [],
  providers: [
    ...handlers,
    TelegramBot,
    {
      provide: 'TELEGRAM_BOT_STATE',
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('telegram.state.host');
        const port = configService.get<string>('telegram.state.port');
        const database = configService.get<number>('telegram.state.database');
        const password = configService.get<string>('telegram.state.password');
        const redis = new Redis({
          host,
          port: Number(port),
          lazyConnect: true,
          db: Number(database),
          password: password,
        });
        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [TelegramBot],
})
export class TelegramBotModule implements OnApplicationBootstrap {
  constructor(
    private telegramBot: TelegramBot,
    private handlerService: HandlerService,
  ) { }

  async onApplicationBootstrap() {
    const handlers = this.handlerService.getHandlers();
    this.telegramBot.registerHandlers(handlers);
    await this.telegramBot.start();
  }
}
