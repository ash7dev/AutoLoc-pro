import { memoryStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIMES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const VEHICLE_PHOTO_MULTER_OPTIONS: MulterOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      const err = new Error('INVALID_FORMAT');
      callback(err, false);
      return;
    }
    callback(null, true);
  },
};
