import { NestFactory } from '@nestjs/core';
import { workerData, parentPort, isMainThread } from 'worker_threads';
import { WorkerThreadModule } from '../worker-thread.module';
import { WorkerThreadService } from '../worker-thread.service';

export const primes = (n: number) => {
  const primes: number[] = [];

  for (let i = 2; i <= n; i++) {
    let isPrime = true;
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(i);
    }
  }
  return primes[primes.length - 1];
};

const loop = () => {
  const st = Date.now();
  while (true) {
    if (Date.now() - st > 20000) {
      break;
    }
  }
  return 1;
};

async function run() {
  // const workerThread =
  //   await NestFactory.createApplicationContext(WorkerThreadModule);
  // const workerThreadService = workerThread.get(WorkerThreadService);
  if (!isMainThread) {
    const numPrimes: number = workerData;
    const prime = primes(numPrimes);
    // const listPrimes = loop();
    parentPort.postMessage(prime);
  }
}

run();
