import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import {
  VEHICLE_PHOTO_EAGER_TRANSFORMATION,
  VEHICLE_PHOTO_FOLDER,
} from './utils/image-optimizer';
import type { UploadResultDto } from './dto/upload-result.dto';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private initialized = false;

  constructor(private readonly configService: ConfigService) { }

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
    return this.uploadToFolder(buffer, VEHICLE_PHOTO_FOLDER, VEHICLE_PHOTO_EAGER_TRANSFORMATION);
  }

  async uploadKycDocument(buffer: Buffer): Promise<UploadResultDto> {
    return this.uploadToFolder(buffer, 'kyc-documents');
  }

  async uploadContract(buffer: Buffer, reservationId: string): Promise<UploadResultDto> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'contrats',
          resource_type: 'raw',
          public_id: `contrat-${reservationId}`,
          format: 'pdf',
        },
        (err: unknown, result: unknown) => {
          if (err) { reject(err); return; }
          const res = result as { secure_url: string; public_id: string } | undefined;
          if (!res) { reject(new Error('Cloudinary upload returned no result')); return; }
          resolve({ url: res.secure_url, publicId: res.public_id });
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }

  getContractDownloadUrl(publicId: string): string {
    // Use cloudinary.url with fl_attachment to force download.
    // The publicId already maps to a .pdf resource (uploaded with format:'pdf'),
    // so we do NOT append .pdf again — that would cause a .pdf.pdf 404 error.
    return cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      secure: true,
      flags: 'attachment',
    });
  }

  async uploadEtatLieuPhoto(buffer: Buffer, reservationId: string, type: string): Promise<UploadResultDto> {
    return this.uploadToFolder(
      buffer,
      `etat-lieux/${reservationId}/${type.toLowerCase()}`,
    );
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  }

  private uploadToFolder(
    buffer: Buffer,
    folder: string,
    eager?: unknown[],
  ): Promise<UploadResultDto> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, ...(eager ? { eager } : {}), resource_type: 'image' },
        (err: unknown, result: unknown) => {
          if (err) { reject(err); return; }
          const res = result as {
            secure_url: string;
            public_id: string;
            eager?: Array<{ secure_url: string }>;
          } | undefined;
          if (!res) { reject(new Error('Cloudinary upload returned no result')); return; }
          resolve({
            url: res.eager?.[0]?.secure_url ?? res.secure_url,
            publicId: res.public_id,
          });
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
