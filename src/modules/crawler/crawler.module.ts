import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { configCrawler } from './configs/crawler';
import { ConfigModule } from '@nestjs/config';
import { RapidTwitterService } from './services/rapid-twitter.service';
import { LunarCrushService } from './services/lunar-crush.service';
import { ScraperApiService } from './services/scraper-api.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configCrawler],
    }),
  ],
  providers: [RapidTwitterService, LunarCrushService, ScraperApiService],
  exports: [RapidTwitterService, LunarCrushService, ScraperApiService],
})
export class CrawlerModule implements OnApplicationBootstrap {
  constructor(
    private readonly rapidTwitterService: RapidTwitterService,
    private readonly lunarCrushService: LunarCrushService,
    private readonly scraperApiService: ScraperApiService,
  ) { }
  async onApplicationBootstrap() {
    // const m = await this.rapidTwitterService.getTweet('1790189394848092578');
    // console.log(
    //   '🚀 ~ CrawlerModule ~ onApplicationBootstrap ~ m:',
    //   JSON.stringify(m),
    // );
    // const t = await this.rapidTwitterService.getListFollowing(
    //   'Akemixzz',
    //   true,
    // );
    // console.log('🚀 ~ CrawlerModule ~ onApplicationBootstrap ~ t:', t.length);
    // const l = await this.rapidTwitterService.fetchTweets('elliotrades', true);
    // console.log(
    //   '🚀 ~ CrawlerModule ~ onApplicationBootstrap ~ l :',
    //   JSON.stringify(l),
    // );
    // const l = await this.rapidTwitterService.fetchUserInfo(
    //   '1649062578805686272',
    // );
    // console.log(
    //   '🚀 ~ CrawlerModule ~ onApplicationBootstrap ~ l :',
    //   JSON.stringify(l.data.user_result.result),
    // );
  }
}
