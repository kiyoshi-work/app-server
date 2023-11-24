import { Bucket, Storage } from '@google-cloud/storage';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class GoogleCloudStorageService implements OnApplicationBootstrap {
  private storage: Storage;
  private bucket: Bucket;
  private bucketPrivate: Bucket;

  onApplicationBootstrap() {
    const BUCKET_NAME = process.env.GOOGLE_APPLICATION_STORAGE_BUCKET;
    const BUCKET_PRIVATE_NAME =
      process.env.GOOGLE_APPLICATION_STORAGE_BUCKET_PRIVATE;
    const storage = new Storage({
      credentials: {
        private_key: process.env.GOOGLE_APPLICATION_CREDENTIALS_PRIVATE_KEY,
        client_email: process.env.GOOGLE_APPLICATION_CREDENTIALS_CLIENT_EMAIL,
      },
    });

    this.storage = storage;
    this.bucket = storage.bucket(BUCKET_NAME);
    this.bucketPrivate = storage.bucket(BUCKET_PRIVATE_NAME);
  }

  protected getBucket(): Bucket {
    return this.bucket;
  }

  protected getBucketPrivate(): Bucket {
    return this.bucketPrivate;
  }

  protected getStorage(): Storage {
    return this.storage;
  }
}
