export const CLIENT_SLUGS = {
  home: `/`,
  event: (id: string) => `/event/${id}`,
};

export const PAGINATION_TAKEN = 10;
export const MAX_PAGINATION_TAKEN = 100;
export const MIN_PAGINATION_TAKEN = 1;
export const NUM_FAN_ETH_TO_HOT = 10;
export const TIMING_BLOCK = 1;
export const ONE_DAY = 1000 * 60 * 60 * 24;
export const IS_PRODUCTION = process.env.APP_ENV == 'production';
