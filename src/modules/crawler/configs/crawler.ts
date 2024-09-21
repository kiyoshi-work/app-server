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
  rapid_api_45: {
    key:
      process.env.RAPID_KEY_45 ||
      'cded57fe77msh96eb35449fb230fp17a709jsna5eedee97cdb',
    host:
      // process.env.RAPID_TWITTER_API_HOST || 'twitter-api47.p.rapidapi.com',
      process.env.RAPID_TWITTER_API_HOST_45 || 'twitter-api45.p.rapidapi.com',
  },

  lunar_crush: {
    token: process.env.LUNAR_CRUSH_TOKEN || '9svht6kf2o8oldlvz6zwnn6p9xny',
    host: process.env.LUNAR_CRUSH_HOST || 'https://lunarcrush.com/api4/public',
  },
  scraper_api: {
    key: process.env.SCRAPER_API_KEY || '063cffa64422e3a4acf8281f36ff6cd7',
    host: process.env.SCRAPER_API_HOST || 'https://api.scraperapi.com',
  },
  tweet_scout: {
    key: process.env.TWEET_SCOUT_KEY || 'aKUuMDeXsNcHCMPc59ivY',
    host: process.env.TWEET_SCOUT_HOST || 'https://tweetscout.io',
  },
  dextool: {
    api_key:
      process.env.DEXTOOL_KEY || 's4WhlXc5yl1FHJLqQKHc61oeYedT4VRG4Ai7xJfa',
    base_url:
      process.env.DEXTOOL_BASE_URL || 'https://public-api.dextools.io/trial/v2',
  },
  birdeye: {
    api_key:
      process.env.BIRDEYE_API_KEY || 'b5b7b6b6-4d5d-4b7d-9b5b-2b5b7b7b7b7b',
    base_url: process.env.BIRDEYE_BASE_URL || 'https://public-api.birdeye.so',
  },
  rugcheck: {
    base_url: process.env.RUGCHECK_BASE_URL || 'https://api.rugcheck.xyz',
  },
  coingecko: {
    host: process.env.COINGECKO_HOST || 'https://pro-api.coingecko.com/api/v3',
    api_key: process.env.COINGECKO_API_KEY,
  },
  dexscreener: {
    api_key: process.env.DEXSCREENER_HOST || 'https://api.dexscreener.com',
  },
}));
