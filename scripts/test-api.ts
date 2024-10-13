import axios from 'axios';

(async () => {
  const url = 'https://multichain-api.birdeye.so/solana/amm/txs/token';

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'agent-id': '34e0b1aa-af3d-4cc0-9fc0-675558a62cd2',
    'cf-be':
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mjg2NDE4OTcsImV4cCI6MTcyODY0MjE5N30.am2A7bP62w7Zx36M5X7xdxQs2QCyjU1nRl1yDw9e03g',
    'content-type': 'application/json',
    origin: 'https://birdeye.so',
    page: undefined,
    priority: 'u=1, i',
    referer: 'https://birdeye.so/',
    'sec-ch-ua':
      '"Microsoft Edge";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    token: undefined,
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.3',
  };

  const data = {
    offset: 15,
    limit: 15,
    export: false,
    query: [
      {
        keyword: 'owner',
        operator: 'in',
        value: ['BNnN2MqfWLvgThYBsv6v8JQaYZXYKYahC5YCy27Ct1cX'],
      },
      {
        keyword: 'blockUnixTime',
        operator: 'gte',
        value: 1728086400,
      },
      {
        keyword: 'blockUnixTime',
        operator: 'lte',
        value: 1728642005,
      },
    ],
  };

  try {
    const response = await axios.post(url, data, {
      headers,
      timeout: 30000,
      // proxy: {
      //   host: 'proxy-server.scraperapi.com',
      //   port: 8001,
      //   auth: {
      //     username: 'scraperapi',
      //     password: '1654fdc02bf53bc9c03f370537b7e5bd',
      //   },
      //   protocol: 'http',
      // },

      proxy: {
        protocol: 'http',
        host: 'proxy-server.scraperapi.com',
        port: 8001,
        auth: {
          username:
            'scraperapi.device_type=desktop.premium=true.country_code=us',
          password: '1654fdc02bf53bc9c03f370537b7e5bd',
        },
      },
    });
    // Handle the response data here
    console.log(response.data);
  } catch (error) {
    // Handle any errors here
    console.error(error);
  }
})();

// import { exec } from 'child_process';

// const curlCommand = `curl -v 'https://paperhands-server-dev.uslab.dev/health' \
//   -H 'accept: */*' \
//   -H 'accept-language: en-US,en;q=0.9,vi;q=0.8' \
//   -H 'priority: u=1, i' \
//   -H 'referer: https://paperhands-server-dev.uslab.dev/docs' \
//   -H 'sec-ch-ua: "Microsoft Edge";v="129", "Not=A?Brand";v="8", "Chromium";v="129"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'sec-fetch-dest: empty' \
//   -H 'sec-fetch-mode: cors' \
//   -H 'sec-fetch-site: same-origin' \
//   -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0'
// `;

// exec(curlCommand, (error, stdout, stderr) => {
//   if (error) {
//     console.error(`Error: ${error}`);
//     return;
//   }
//   if (stderr) {
//     console.error(`stderr: ${stderr}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
// });
