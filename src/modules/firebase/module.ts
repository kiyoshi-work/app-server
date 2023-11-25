import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import {
  FirebaseAsyncOptions,
  FirebaseAsyncOptionsFactory,
  FirebaseOptions,
} from './options';
import * as admin from 'firebase-admin';
import { AppFirestoreRepository } from '@/modules/firebase/repositories/app-firestore.repository';

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
          provide: 'APP_FIRESTORE',
          useClass: AppFirestoreRepository,
        },
      ],
      exports: [
        'FIREBASE_CONNECTION',
        'FIREBASE_AUTH',
        'FIREBASE_FIRESTORE',
        'FIREBASE_MESSAGING',
        'FIREBASE_STORAGE',
        'APP_FIRESTORE',
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
          provide: 'APP_FIRESTORE_CONFIG',
          useFactory: async (inject: any[]) => {
            const firebaseOptions = await options.useFactory(inject);
            return firebaseOptions.appFireStore;
          },
          inject: options.inject || [],
        },
      ];
    } else {
      const inject = [options.useExisting as Type<FirebaseOptions>];

      providers = [
        {
          provide: 'APP_FIRESTORE_CONFIG',
          useFactory: async (optionsFactory: FirebaseAsyncOptionsFactory) => {
            const firebaseOptions = await optionsFactory.createOptions();
            return firebaseOptions.appFireStore;
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
