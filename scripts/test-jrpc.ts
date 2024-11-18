// eslint-disable-file no-use-before-define
import axios from 'axios';
axios
  .post(
    'http://localhost:8000/rpc',
    {
      jsonrpc: '2.0',
      method: 'health.check',
      // method: 'health.guard',
      // method: 'health.signin',
      id: 2,
      params: {
        test: 1,
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IiIsImlhdCI6MTczMTkyNTA5OH0.vNaeQG7pr-OOczpB0qW1sCZ4lBwAbPM-IlVRnnkYjT4',
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  )
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });
