import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import {
  FirebaseAsyncOptions,
  FirebaseAsyncOptionsFactory,
  FirebaseOptions,
} from './options';
import * as admin from 'firebase-admin';
import { Goal3Firestore } from '@/modules/firebase/goal3/goal3-firestore';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class FirebaseModule {
  /**
   * Register options
   * @param options
   */
  static registerAsync(options: FirebaseAsyncOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: FirebaseModule,
      imports: [DiscoveryModule],
      providers: [
        this.createConnectionProvider(options),
        ...this.createProviders(options),
        {
          provide: 'GOAL3_FIRESTORE',
          useClass: Goal3Firestore,
        },
      ],
      exports: [
        'FIREBASE_CONNECTION',
        'FIREBASE_AUTH',
        'FIREBASE_FIRESTORE',
        'FIREBASE_MESSAGING',
        'FIREBASE_STORAGE',
        'GOAL3_FIRESTORE',
      ],
    };
  }

  private static createConnectionProvider(options: FirebaseAsyncOptions) {
    if (options.useFactory) {
      return {
        provide: 'FIREBASE_CONNECTION',
        useFactory: async (inject: any[]) => {
          const firebaseOptions = await options.useFactory(inject);
          return admin.initializeApp({
            credential: admin.credential.cert({
              projectId: firebaseOptions.projectId,
              privateKey: firebaseOptions.privateKey,
              clientEmail: firebaseOptions.clientEmail,
            }),
          });
        },
        inject: options.inject || [],
      };
    }
    const inject = [options.useExisting as Type<FirebaseOptions>];

    return {
      provide: 'FIREBASE_CONNECTION',
      useFactory: async (optionsFactory: FirebaseAsyncOptionsFactory) => {
        const firebaseOptions = await optionsFactory.createOptions();
        return admin.initializeApp({
          credential: admin.credential.cert({
            projectId: firebaseOptions.projectId,
            privateKey: firebaseOptions.privateKey,
            clientEmail: firebaseOptions.clientEmail,
          }),
        });
      },
      inject,
    };
  }

  private static createProviders(options: FirebaseAsyncOptions): Provider[] {
    let providers = [];
    if (options.useFactory) {
      providers = [
        {
          provide: 'GOAL3_FIRESTORE_CONFIG',
          useFactory: async (inject: any[]) => {
            const firebaseOptions = await options.useFactory(inject);
            return firebaseOptions.goal3FireStore;
          },
          inject: options.inject || [],
        },
      ];
    } else {
      const inject = [options.useExisting as Type<FirebaseOptions>];

      providers = [
        {
          provide: 'GOAL3_FIRESTORE_CONFIG',
          useFactory: async (optionsFactory: FirebaseAsyncOptionsFactory) => {
            const firebaseOptions = await optionsFactory.createOptions();
            return firebaseOptions.goal3FireStore;
          },
          inject,
        },
      ];
    }

    return [
      ...providers,
      {
        provide: 'FIREBASE_AUTH',
        useFactory: async (app: admin.app.App) => {
          return app.auth();
        },
        inject: ['FIREBASE_CONNECTION'],
      },
      {
        provide: 'FIREBASE_MESSAGING',
        useFactory: async (app: admin.app.App) => {
          return app.messaging();
        },
        inject: ['FIREBASE_CONNECTION'],
      },
      {
        provide: 'FIREBASE_FIRESTORE',
        useFactory: async (app: admin.app.App) => {
          return app.firestore();
        },
        inject: ['FIREBASE_CONNECTION'],
      },
      {
        provide: 'FIREBASE_STORAGE',
        useFactory: async (app: admin.app.App) => {
          return app.storage();
        },
        inject: ['FIREBASE_CONNECTION'],
      },
    ];
  }
}
