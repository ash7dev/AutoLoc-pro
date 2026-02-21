import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';
import {
  VEHICLE_PHOTO_EAGER_TRANSFORMATION,
  VEHICLE_PHOTO_FOLDER,
} from './utils/image-optimizer';
import type { UploadResultDto } from './dto/upload-result.dto';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    if (this.initialized) return;
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required');
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    this.initialized = true;
  }

  async uploadVehiclePhoto(buffer: Buffer): Promise<UploadResultDto> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: VEHICLE_PHOTO_FOLDER,
          eager: VEHICLE_PHOTO_EAGER_TRANSFORMATION,
          resource_type: 'image',
        },
        (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result) {
            reject(new Error('Cloudinary upload returned no result'));
            return;
          }
          const eagerUrl = (result as UploadApiResponse & { eager?: Array<{ secure_url: string }> }).eager?.[0]?.secure_url;
          resolve({
            url: eagerUrl ?? result.secure_url,
            publicId: result.public_id,
          });
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
