import { ModuleMetadata, Type } from '@nestjs/common';

export interface Goal3FirestoreConfig {
  spaceId: string;
}

export interface FirebaseOptions {
  isGlobal?: boolean;
  projectId: string;
  privateKey: string;
  clientEmail: string;
  goal3FireStore: Goal3FirestoreConfig;
}

export interface FirebaseAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  isGlobal: boolean;
  useExisting?: Type<FirebaseOptions>;
  useFactory?: (...args: any[]) => Promise<FirebaseOptions> | FirebaseOptions;
  inject?: any[];
}

export interface FirebaseAsyncOptionsFactory {
  createOptions(): Promise<FirebaseOptions> | FirebaseOptions;
}
