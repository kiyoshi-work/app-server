import { File } from '@google-cloud/storage';
import admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import Firestore = admin.firestore.Firestore;
import Storage = admin.storage.Storage;

const STORAGE_PUBLIC_URL = 'https://storage.googleapis.com';

export class FirebaseService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        // credential: admin.credential.applicationDefault(),
        credential: cert({
          projectId: process.env.GOOGLE_APPLICATION_CREDENTIALS_PROJECT_ID,
          clientEmail: process.env.GOOGLE_APPLICATION_CREDENTIALS_CLIENT_EMAIL,
          privateKey: process.env.GOOGLE_APPLICATION_CREDENTIALS_PRIVATE_KEY,
        }),
        storageBucket: process.env.GOOGLE_APPLICATION_STORAGE_BUCKET,
      });
    }
  }

  protected fireStore(): Firestore {
    return admin.firestore();
  }

  protected fireStorage(): Storage {
    return admin.storage();
  }

  protected getPublicUrl(file: File): string {
    return `${STORAGE_PUBLIC_URL}/${file.bucket.name}/${file.name}`;
  }
}
