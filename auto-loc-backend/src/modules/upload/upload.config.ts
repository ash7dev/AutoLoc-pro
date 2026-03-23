import { memoryStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const PHOTO_ALLOWED_MIMES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const DOCUMENT_ALLOWED_MIMES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

/** @deprecated Utiliser PHOTO_ALLOWED_MIMES — conservé pour rétrocompatibilité */
export const ALLOWED_MIMES = PHOTO_ALLOWED_MIMES;

export const VEHICLE_PHOTO_MULTER_OPTIONS: MulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!PHOTO_ALLOWED_MIMES.has(file.mimetype)) {
      callback(new Error('INVALID_FORMAT'), false);
      return;
    }
    callback(null, true);
  },
};

export const VEHICLE_DOCUMENT_MULTER_OPTIONS: MulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!DOCUMENT_ALLOWED_MIMES.has(file.mimetype)) {
      callback(new Error('INVALID_FORMAT'), false);
      return;
    }
    callback(null, true);
  },
};
