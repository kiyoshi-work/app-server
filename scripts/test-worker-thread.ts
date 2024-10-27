import axios from 'axios';

(async () => {
  const st = Date.now();
  Array.from({ length: 10 }).map((dt) => {
    axios
      .get('http://localhost:8000/api/health/test-worker-thread')
      .then((res) => {
        console.log(res.data, Date.now() - st);
      });
  });
  //   WITH WORKER THREAD:
  // 9999991 10497
  // 9999991 10524
  // 9999991 10578
  // 9999991 10581
  // 9999991 10706
  // 9999991 10707
  // 9999991 10708
  // 9999991 10708
  // 9999991 10826
  // 9999991 10937

  //   WITHOUT WORKER THREAD:
  // 9999991 3124
  // 9999991 5455
  // 9999991 8091
  // 9999991 10533
  // 9999991 12992
  // 9999991 15346
  // 9999991 17756
  // 9999991 20013
  // 9999991 22279
  // 9999991 24514

  // await Promise.all([
  //   ...Array.from({ length: 10 }).map(async (dt) => {
  //     const res = await axios.get(
  //       'http://localhost:8000/api/health/test-worker-thread',
  //     );
  //     console.log(res.data, dt);
  //   }),
  //   (async () => {
  //     const res = await fetch('https://example.com/');
  //     const t = await res.json();
  //   })(),
  // ]);
})();
