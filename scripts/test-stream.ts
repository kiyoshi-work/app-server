// eslint-disable-file no-use-before-define 
import axios from 'axios';

(async () => {
  axios({
    method: 'post',
    data: {
      "question": "what is bitcoin",
      "thread_id": "6f559b00-f86f-4a81-be03-ea8cc9de1d37",
    },
    url: 'http://localhost:8030/assistant/conversation',
    responseType: 'stream',
    headers: {
      'Accept': '*/*'
    }
  })
    .then(response => {
      response.data.on('data', (chunk) => {
        console.log('====> data:', chunk.toString());
      });

      response.data.on('end', () => {
        console.log('end stream');
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
})()