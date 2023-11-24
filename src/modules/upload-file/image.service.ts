import { File, GetSignedUrlConfig } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ImageFolder } from './enum';
import { GoogleCloudStorageService } from './google-cloud-storage.service';
import { imageType } from './util';

@Injectable()
export class ImageService extends GoogleCloudStorageService {
  // async uploadFromMulterFile(
  //   imageFile: Buffer,
  //   folder: ImageFolder,
  // ): Promise<string> {
  //   const bucket = this.fireStorage().bucket();
  //   const fileType = await imageType(imageFile);
  //   const file: any = bucket.file(`${folder}/images/${uuidv4()}.${fileType}`);

  //   await file.save(imageFile, {
  //     public: true,
  //     resumable: false,
  //     // gzip: true,
  //     metadata: {
  //       firebaseStorageDownloadTokens: uuidv4(),
  //     },
  //   });
  //   return this.getPublicUrl(file);
  // }

  async uploadImageProfile(imageFile: Buffer, name?: string): Promise<string> {
    const fileType = await imageType(imageFile);
    const file = this.getBucket().file(
      `${ImageFolder.Profile}/images/${name || uuidv4()}.${fileType}`,
    );
    await file.save(imageFile, {
      public: true,
    });
    return this.getFileUrl(file);
  }

  async uploadImage(
    imageFile: Buffer,
    folder: ImageFolder,
    isPublic: boolean = true,
  ): Promise<string> {
    const fileType = await imageType(imageFile);
    if (isPublic) {
      const file = this.getBucket().file(
        `${folder}/images/${uuidv4()}.${fileType}`,
      );
      await file.save(imageFile, {
        public: isPublic,
      });
      return this.getFileUrl(file);
    } else {
      const file = this.getBucketPrivate().file(
        `${folder}/images/${uuidv4()}.${fileType}`,
      );
      await file.save(imageFile, {
        public: isPublic,
      });
      return this.getFileUrlPrivate(file);
    }
  }

  async uploadThumbail(
    imageFile: Buffer,
    folder: ImageFolder,
  ): Promise<string> {
    const fileType = await imageType(imageFile);
    const file = this.getBucket().file(
      `${folder}/thumbnails/${uuidv4()}.${fileType}`,
    );
    await file.save(imageFile, {
      public: true,
    });
    return this.getFileUrl(file);
  }

  protected getFileUrl(file: File): string {
    if (process.env.APP_ENV === 'local' || !process.env.GOOGLE_CDN_URL) {
      return file.publicUrl();
    }
    return `${process.env.GOOGLE_CDN_URL}/${file.name}`;
  }

  async generateSignedUrl(url: string, expired: number = 5 * 60 * 1000) {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + expired, // 5 minutes
    };
    // Get a v4 signed URL for uploading file
    const [signedUrl] = await this.getBucketPrivate()
      .file(this.getFilePath(url))
      .getSignedUrl(options);
    return signedUrl;
  }

  protected getFilePath(fileUrl: string): string {
    if (fileUrl.startsWith('https://storage.googleapis.com/')) {
      const pathAfterDomain = fileUrl.replace(
        'https://storage.googleapis.com/',
        '',
      );
      // Split the remaining path using "/" as the delimiter and return the file path
      const filePath = pathAfterDomain.split('/').slice(1).join('/');
      return filePath;
    }
    return new URL(fileUrl).pathname?.substring(1);
    // return fileUrl.match(/:\/\/[^/]+(\/[^?]+)/)[1];
  }

  protected getFileUrlPrivate(file: File): string {
    if (
      process.env.APP_ENV === 'local' ||
      !process.env.GOOGLE_CDN_URL_PRIVATE
    ) {
      return file.publicUrl();
    }
    return `${process.env.GOOGLE_CDN_URL_PRIVATE}/${file.name}`;
  }
}
