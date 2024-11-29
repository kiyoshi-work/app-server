import path from 'path';

// it will import the compiled js file from dist directory
export const listPrimesFilePath = path.join(
  __dirname,
  '../tasks/list-primes.task.js',
);
