import { registerAs } from '@nestjs/config';

export const configCrawler = registerAs('crawler', () => ({
  rapid_api: {
    key:
      process.env.RAPID_KEY ||
      '1ce2203c8dmsh2d0e3be3749a9f5p146142jsnf4ae3a8cf6ce',
    twitter_host:
      // process.env.RAPID_TWITTER_API_HOST || 'twitter-api47.p.rapidapi.com',
      process.env.RAPID_TWITTER_API_HOST || 'twttrapi.p.rapidapi.com',
  },
  lunar_crush: {
    token: process.env.LUNAR_CRUSH_TOKEN || '9svht6kf2o8oldlvz6zwnn6p9xny',
    host: process.env.LUNAR_CRUSH_HOST || 'https://lunarcrush.com/api4/public',
  },
  scraper_api: {
    key: process.env.SCRAPER_API_KEY || '44197a3b75773be1cdf93a3dab622167',
    host: process.env.SCRAPER_API_HOST || 'https://api.scraperapi.com',
  },
  tweet_scout: {
    key: process.env.TWEET_SCOUT_KEY || 'aKUuMDeXsNcHCMPc59ivY',
    host: process.env.TWEET_SCOUT_HOST || 'https://tweetscout.io',
  },
  dextool: {
    api_key:
      process.env.DEXTOOL_KEY || 's4WhlXc5yl1FHJLqQKHc61oeYedT4VRG4Ai7xJfa',
    base_url: process.env.DEXTOOL_BASE_URL || 'https://api.dextools.io',
  },
  birdeye: {
    api_key:
      process.env.BIRDEYE_API_KEY || 'b5b7b6b6-4d5d-4b7d-9b5b-2b5b7b7b7b7b',
    base_url: process.env.BIRDEYE_BASE_URL || 'https://public-api.birdeye.so',
  },
}));
