import axios from 'axios';

(async () => {
  const req = await axios.get(`http://localhost:8765/api/app/chart`, {
    timeout: 200000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    params: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      indicators: undefined,
      resolution: undefined,
      symbol: 'USDC',
      priceScale: undefined,
    },
    headers: {
      accept: '*/*',
    },
  } as any);
  if (req.data) {
    console.log('[getImageCrawler] [Image]', req.data); // console by M-MON
    return req.data;
  }

  // const req = await axios.get(`http://localhost:8765/api/app/data_chart`, {
  //   timeout: 100000,
  //   params: {
  //     address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  //     // resolution: '5',
  //   },
  //   headers: {
  //     accept: '*/*',
  //   },
  // } as any);
  // if (req.data) {
  //   console.log('[getDataCrawler]', req.data); // console by M-MON
  //   return req.data;
  // }
})();