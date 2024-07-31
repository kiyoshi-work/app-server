// eslint-disable-file no-use-before-define
import axios from 'axios';
import UserAgent from 'user-agents';

(async () => {
  let ids: any[] = [];
  for (let i = 0; i < 20; i++) {
    console.log('-->', i);
    try {
      const _dt = await axios({
        method: 'GET',
        url: 'https://api.ai/blogs',
        params: {
          take: 100,
          page: i + 1,
          sort_type: 'ASC',
        },
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MmI5OWQyMS1mMzgzLTRmOTQtYjc1Mi0zNjNkMzY4OTYyMzEiLCJ0ZWxlZ3JhbV9pZCI6IjU2NjU4NjA0MTUiLCJpYXQiOjE3MjIzMzQ1MTgsImV4cCI6MTcyMjkzOTMxOH0.H3zPtoywUfZA-O7gPEOvAclvCZ_j-jH0-V-tjj3GdIA',
          // 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NTE4NTRhMy1hMWZiLTRiYjEtYWRkZS1lZGM3YzU0NWEzMTYiLCJ0ZWxlZ3JhbV9pZCI6IjU2NjU4NjA0MTUiLCJpYXQiOjE3MjIzMzM1MDAsImV4cCI6MTcyMjkzODMwMH0.--OVaMjAkwbj4pHpggnisDVe4G42jVgcBgQrqqMAM4g',
        },
      });
      ids = [...ids, ..._dt.data?.data.map((m) => m.id)];
    } catch (e) {
      let err = '';
      if (e?.response?.data) {
        err = e?.response?.data;
      }
      console.error('-- ERROR:', err);
    }
  }
  console.log('🚀 ~ ids:', ids);

  const data = await axios({
    method: 'PUT',
    url: 'https://api.ai/telegram/update-points',
    data: {
      blog_ids: ids,
      // blog_ids: [...Array(1).keys()].map(
      //   (x) => '2ff120a4-b184-4f73-b625-faa9b967aaf3',
      // ),
    },
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MmI5OWQyMS1mMzgzLTRmOTQtYjc1Mi0zNjNkMzY4OTYyMzEiLCJ0ZWxlZ3JhbV9pZCI6IjU2NjU4NjA0MTUiLCJpYXQiOjE3MjIzMzQ1MTgsImV4cCI6MTcyMjkzOTMxOH0.H3zPtoywUfZA-O7gPEOvAclvCZ_j-jH0-V-tjj3GdIA',
      // 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NTE4NTRhMy1hMWZiLTRiYjEtYWRkZS1lZGM3YzU0NWEzMTYiLCJ0ZWxlZ3JhbV9pZCI6IjU2NjU4NjA0MTUiLCJpYXQiOjE3MjIzMzM1MDAsImV4cCI6MTcyMjkzODMwMH0.--OVaMjAkwbj4pHpggnisDVe4G42jVgcBgQrqqMAM4g',
    },
  });
  console.log(
    data.data?.data?.total_points,
    data.data?.data?.total_swipe_count,
    data.data?.data?.swipe_count_today,
  );
})();
