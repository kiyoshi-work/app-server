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
    // const t = await this.rapidTwitterService.getListFollowing('167814881');
    // console.log('🚀 ~ CrawlerModule ~ onApplicationBootstrap ~ t:', t);
    // const l = await this.lunarCrushService.fetchTweets('elonmusk');
    // console.log('🚀 ~ CrawlerModule ~ onApplicationBootstrap ~ l :', l);
    // const m = await this.scraperApiService.test();
    // console.log('🚀 ~ CrawlerModule ~ onApplicationBootstrap ~ m:', m);
  }
}
