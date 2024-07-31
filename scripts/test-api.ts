// eslint-disable-file no-use-before-define
import axios from 'axios';
import UserAgent from 'user-agents';

(async () => {
  try {
    // const data = await axios({
    //   timeout: 30000,
    //   // proxy: {
    //   //   protocol: 'http',
    //   //   host: 'proxy-server.scraperapi.com',
    //   //   port: 8001,
    //   //   auth: {
    //   //     username:
    //   //       'scraperapi.device_type=desktop.premium=true.country_code=us',
    //   //     password: '44197a3b75773be1cdf93a3dab622167',
    //   //   },
    //   // },
    //   method: 'PUT',
    //   // url: `https://www.dextools.io/app/en/ether/pair-explorer/0x5201523c0ad5ba792c40ce5aff7df2d1a721bbf8?t=1715315222267`,
    //   url: 'https://api.cryptos.ai/telegram/update-points',
    //   data: {
    //     blog_ids: ['4785cbd0-299f-48dc-b74b-91298f0755f0'],
    //   },
    //   headers: {
    //     'user-agent': new UserAgent().toString(),
    //     Authorization:
    //       'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MmI5OWQyMS1mMzgzLTRmOTQtYjc1Mi0zNjNkMzY4OTYyMzEiLCJ0ZWxlZ3JhbV9pZCI6IjU2NjU4NjA0MTUiLCJpYXQiOjE3MjIyNzU1MTMsImV4cCI6MTcyMjg4MDMxM30.aCuY5GrVIg9UVvRwS913lkAutBatDUy1rRRevBewcHM',
    //   },
    // });
    // console.log(data);

    const _dt = await axios({
      method: 'GET',
      url: 'https://api.cryptos.ai/blogs',
      params: {
        take: 100,
        page: 0,
        sort_type: 'ASC',
      },
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MmI5OWQyMS1mMzgzLTRmOTQtYjc1Mi0zNjNkMzY4OTYyMzEiLCJ0ZWxlZ3JhbV9pZCI6IjU2NjU4NjA0MTUiLCJpYXQiOjE3MjIyNzU1MTMsImV4cCI6MTcyMjg4MDMxM30.aCuY5GrVIg9UVvRwS913lkAutBatDUy1rRRevBewcHM',
      },
    });
    console.log(_dt?.data?.data);
    // console.log(
    //   data?.data?.data?.total_points,
    //   '----',
    //   data?.data?.data?.total_diamonds,
    // );
  } catch (e) {
    let err = '';
    if (e?.response?.data) {
      err = e?.response?.data;
    }
    console.error('-- ERROR:', err);
  }
})();
