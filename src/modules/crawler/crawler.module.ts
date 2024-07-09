import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { configCrawler } from './configs/crawler';
import { ConfigModule } from '@nestjs/config';
import { RapidTwitterService } from './services/rapid-twitter.service';
import { LunarCrushService } from './services/lunar-crush.service';
import { ScraperApiService } from './services/scraper-api.service';
import { DexToolService } from './services/dextool.service';
import { BirdEyeService, EChainName } from './services/birdeye.service';
import { RugcheckService } from './services/rugcheck.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configCrawler],
    }),
  ],
  providers: [
    RapidTwitterService,
    LunarCrushService,
    ScraperApiService,
    DexToolService,
    BirdEyeService,
    RugcheckService,
  ],
  exports: [
    RapidTwitterService,
    LunarCrushService,
    ScraperApiService,
    DexToolService,
    BirdEyeService,
    RugcheckService,
  ],
})
export class CrawlerModule implements OnApplicationBootstrap {
  constructor(
    private readonly rapidTwitterService: RapidTwitterService,
    private readonly lunarCrushService: LunarCrushService,
    private readonly scraperApiService: ScraperApiService,
    private readonly dexToolService: DexToolService,
    private readonly birdEyeService: BirdEyeService,
    private readonly rugcheckService: RugcheckService,
  ) {}
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
    //
    // const t = await this.dexToolService.getAuditTokenByAddress(
    //   'GTH3wG3NErjwcf7VGCoXEXkgXSHvYhx5gtATeeM5JAS1',
    // );
    // console.log('🚀 ~ CrawlerModule ~ onApplicationBootstrap ~ t:', t);
    //
    // const q = await this.birdEyeService.getTokenTradesHistory(
    //   'GTH3wG3NErjwcf7VGCoXEXkgXSHvYhx5gtATeeM5JAS1',
    //   EChainName.SOLANA,
    // );
    // console.log('🚀 ~ CrawlerModule ~ onApplicationBootstrap ~ q:', q);
    const k = await this.rugcheckService.getRugCheckInfo(
      'GTH3wG3NErjwcf7VGCoXEXkgXSHvYhx5gtATeeM5JAS1',
    );
    console.log('🚀 ~ CrawlerModule ~ onApplicationBootstrap ~ k :', k);
  }
}
