import { Injectable } from '@nestjs/common';
import { Worker, isMainThread } from 'worker_threads';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { listPrimesFilePath } from './configs/worker-thread.config';

@Injectable()
export class WorkerThreadService {
  constructor() {} // private readonly logger: PinoLogger, // @InjectPinoLogger(WorkerThreadService.name)
  checkMainThread() {
    console.debug(
      'Are we on the main thread here?',
      isMainThread ? 'Yes.' : 'No.',
    );
    return isMainThread;
  }

  runWorker(filepath: string, data: any): Promise<any> {
    this.checkMainThread();
    return new Promise((resolve, reject) => {
      const worker = new Worker(filepath, {
        workerData: data,
      });
      worker.on('message', (result) => {
        console.info('Worker success: ' + filepath);
        resolve(result);
      });
      worker.on('error', (e) => {
        console.log('Worker error ', e);
        reject(e);
      });
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  runPrimesWorker(numPrices: number) {
    return this.runWorker(listPrimesFilePath, numPrices);
  }
}
