import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import {
  VEHICLE_PHOTO_FOLDER,
  VEHICLE_PHOTO_TRANSFORM,
} from './utils/image-optimizer';
import type { UploadResultDto } from './dto/upload-result.dto';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private initialized = false;
  private cloudName: string = '';
  private apiKey: string = '';
  private apiSecret: string = '';

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
    this.cloudName = cloudName;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.initialized = true;
  }

  getUploadSignature(): { signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string } {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = VEHICLE_PHOTO_FOLDER;
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, this.apiSecret);
    return { signature, timestamp, apiKey: this.apiKey, cloudName: this.cloudName, folder };
  }

  getDocumentUploadSignature(vehicleId: string, docType: string): { signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string } {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `vehicule-docs/${vehicleId}/${docType}`;
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, this.apiSecret);
    return { signature, timestamp, apiKey: this.apiKey, cloudName: this.cloudName, folder };
  }

  async uploadVehiclePhoto(buffer: Buffer): Promise<UploadResultDto> {
    const result = await this.uploadToFolder(buffer, VEHICLE_PHOTO_FOLDER);
    // Injecte les paramètres de transformation dans l'URL publique.
    // Cloudinary génère la version optimisée au premier accès et la cache indéfiniment.
    // L'upload lui-même n'attend plus la génération synchrone (eager) → ~3× plus rapide.
    const url = result.url.replace('/upload/', `/upload/${VEHICLE_PHOTO_TRANSFORM}/`);
    return { ...result, url };
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
    // Generate a signed private download URL valid for 5 minutes.
    // Avoids Cloudinary 401s caused by unsigned raw/attachment URLs
    // when Strict Transformations is enabled on the cloud.
    const normalizedId = publicId.replace(/\.pdf$/i, '');
    const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (cloudinary.utils as any).private_download_url(
      `${normalizedId}.pdf`,
      'pdf',
      { resource_type: 'raw', expires_at: expiresAt, attachment: true },
    );
  }

  async uploadEtatLieuPhoto(buffer: Buffer, reservationId: string, type: string): Promise<UploadResultDto> {
    return this.uploadToFolder(
      buffer,
      `etat-lieux/${reservationId}/${type.toLowerCase()}`,
    );
  }

  async uploadVehicleDocument(buffer: Buffer, vehicleId: string, docType: string): Promise<UploadResultDto> {
    return this.uploadToFolder(buffer, `vehicule-docs/${vehicleId}/${docType}`, 'auto');
  }

  async uploadPermisDocument(buffer: Buffer, userId: string): Promise<UploadResultDto> {
    return this.uploadToFolder(buffer, `permis/${userId}`);
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  }

  /** Supprime un document (image ou PDF) — essaie les deux resource_type. */
  async deleteDocumentByPublicId(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(() => { });
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }).catch(() => { });
  }

  private uploadToFolder(
    buffer: Buffer,
    folder: string,
    resourceType: 'image' | 'auto' = 'image',
  ): Promise<UploadResultDto> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
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
}
