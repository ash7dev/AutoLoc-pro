import { fileTypeFromBuffer } from 'file-type';

export async function assertValidImageBuffer(
  buffer: Buffer,
  allowedMimes: Set<string>,
): Promise<string> {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !detected.mime.startsWith('image/')) {
    throw new Error('INVALID_FORMAT');
  }
  if (!allowedMimes.has(detected.mime)) {
    throw new Error('INVALID_FORMAT');
  }
  return detected.mime;
}
