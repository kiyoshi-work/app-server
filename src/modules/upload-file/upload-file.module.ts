import { Module } from '@nestjs/common';
import { GoogleCloudStorageService } from './google-cloud-storage.service';
import { ImageService } from './image.service';

@Module({
  imports: [],
  providers: [GoogleCloudStorageService, ImageService],
  exports: [ImageService],
})
export class UploadFileModule {}
