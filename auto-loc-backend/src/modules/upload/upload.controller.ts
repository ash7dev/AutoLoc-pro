import {
  Controller,
  Post,
  UseInterceptors,
  UseFilters,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ALLOWED_MIMES, VEHICLE_PHOTO_MULTER_OPTIONS } from './upload.config';
import { MulterExceptionFilter } from './multer-exception.filter';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import { assertValidImageBuffer } from '../../infrastructure/cloudinary/utils/file-validator';

@Controller('upload')
@UseFilters(MulterExceptionFilter)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('vehicle-photo')
  @UseInterceptors(FileInterceptor('file', VEHICLE_PHOTO_MULTER_OPTIONS))
  async uploadVehiclePhoto(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<{ url: string; publicId: string }> {
    if (!file?.buffer) {
      throw new BadRequestException('File is required');
    }
    try {
      await assertValidImageBuffer(file.buffer, ALLOWED_MIMES);
    } catch {
      throw new BadRequestException('Invalid file format. Allowed: JPEG, PNG, WebP.');
    }

    try {
      const result = await this.cloudinaryService.uploadVehiclePhoto(file.buffer);
      return result;
    } catch (err) {
      this.logger.error(
        err instanceof Error ? err.message : 'Cloudinary upload failed',
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException('Upload failed');
    }
  }
}
