// eslint-disable-file no-use-before-define
import axios from 'axios';

(async () => {
  const data = await axios({
    method: 'GET',
    url: 'https://host/portfolio/open-orders?page=2&take=20&status=ACTIVE',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZTE3MDg0Ny0yZTk1LTRjNTUtYTI2Ny0xN2VmZDE2NjBlMDQiLCJhZGRyZXNzIjoiMHhmOUY2ODkzNjc5OTBmOTgxQkNEMjY3RkIxQTRjNDVmNjNCNkJkN2IxIiwiaWF0IjoxNzIxNTg2MDIxLCJleHAiOjE3MjE2NzI0MjF9.kGzuQ5VsxuzSad47U2vBcigT9nDP7-HaZc9pEFJ-dPQ',
    },
  });
  console.log(data.data?.data?.data);
})();
