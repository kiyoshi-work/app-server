import { registerAs } from '@nestjs/config';
import { FirebaseOptions } from '@/modules/firebase';

export const configFirebase = registerAs(
  'firebase',
  (): FirebaseOptions => ({
    isGlobal: true,
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    goal3FireStore: {
      spaceId: process.env.CHAIN_ID + '_' + process.env.SPACE_NAME,
    },
  }),
);
