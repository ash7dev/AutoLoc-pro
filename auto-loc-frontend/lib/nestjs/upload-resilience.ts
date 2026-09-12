export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  detection?: string;
}

export type UploadProgressCallback = (percent: number) => void;

/**
 * Compress an image client-side before upload to reduce payload from 15MB down to ~300KB-600KB.
 * Ensures ultra-fast upload even on slow 3G/4G Senegal mobile networks.
 */
export async function compressImageResilient(
  file: File,
  maxDimension = 1920,
  quality = 0.82
): Promise<File> {
  if (typeof window === 'undefined') return file;
  // If not an image (e.g. PDF document) or already lightweight (< 350 KB), no need to compress
  if (!file.type.startsWith('image/') || file.size < 350 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    let settled = false;

    const finish = (resultFile: File) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
      resolve(resultFile);
    };

    // 4 second strict timeout for image loading/canvas processing
    const timeoutId = setTimeout(() => {
      console.warn('[Compress] Timeout - fallback vers le fichier d’origine');
      finish(file);
    }, 4000);

    img.onerror = () => {
      console.warn('[Compress] Impossible de charger l’image - fallback vers le fichier d’origine');
      finish(file);
    };

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width <= 0 || height <= 0) {
          finish(file);
          return;
        }

        // Downscale maintaining aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > 0 && blob.size < file.size) {
              const newName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
              finish(new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() }));
            } else {
              // If blob is somehow larger or null, keep original
              finish(file);
            }
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        console.error('[Compress] Erreur Canvas:', err);
        finish(file);
      }
    };

    try {
      img.src = objectUrl;
    } catch {
      finish(file);
    }
  });
}

/**
 * Execute an HTTP POST upload using XMLHttpRequest for real-time progress callbacks (0-100%).
 */
function uploadWithXHRProgress(
  url: string,
  form: FormData,
  options?: { timeoutMs?: number; onProgress?: UploadProgressCallback }
): Promise<{ secure_url: string; public_id: string; info?: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const timeoutMs = options?.timeoutMs ?? 60_000;

    xhr.timeout = timeoutMs;

    if (options?.onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
          options.onProgress?.(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as { secure_url: string; public_id: string; info?: unknown };
          options?.onProgress?.(100);
          resolve(response);
        } catch {
          reject(new Error('Réponse invalide du serveur d’upload.'));
        }
      } else {
        const text = xhr.responseText || '';
        console.error(`[Upload XHR] Échec (${xhr.status}):`, text.substring(0, 300));

        if (xhr.status === 401 || xhr.status === 403) {
          reject(new Error('SIGNATURE_EXPIRED'));
        } else if (xhr.status === 413) {
          reject(new Error('Le fichier est trop volumineux pour être téléversé.'));
        } else if (xhr.status === 429) {
          reject(new Error('Le service d’upload est temporairement saturé. Veuillez rééquilibrer vos envois.'));
        } else {
          reject(new Error(`Le service d’upload a refusé ce fichier (${xhr.status}).`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Erreur de connexion réseau lors du téléversement. Vérifiez votre connexion internet.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Le téléversement a expiré suite à une connexion trop lente.'));
    };

    xhr.onabort = () => {
      reject(new Error('Téléversement annulé.'));
    };

    xhr.open('POST', url, true);
    xhr.send(form);
  });
}

/**
 * Resilient Cloudinary uploader with automatic client-side compression, signature renewal on 401/403,
 * exponential backoff retry for network glitches, and real-time progress callbacks.
 */
export async function uploadToCloudinaryResilient(
  file: File,
  sigFetcher: () => Promise<CloudinarySignature>,
  options?: {
    isDocument?: boolean;
    detectFace?: boolean;
    onProgress?: UploadProgressCallback;
    maxAttempts?: number;
  }
): Promise<{ url: string; publicId: string }> {
  const maxAttempts = options?.maxAttempts ?? 3;
  let currentSig: CloudinarySignature | null = null;
  let lastError: unknown;

  // Step 1: Compress image client-side to guarantee lightweight size (< 500 KB)
  options?.onProgress?.(5);
  const compressedFile = await compressImageResilient(file);
  options?.onProgress?.(15);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Step 2: Fetch or refresh Cloudinary upload signature
      if (!currentSig || attempt > 1) {
        console.log(`[Upload Resilience] Obtention d'une signature fraîche (tentative ${attempt}/${maxAttempts})...`);
        currentSig = await sigFetcher();
      }

      const form = new FormData();
      form.append('file', compressedFile);
      form.append('timestamp', String(currentSig.timestamp));
      form.append('api_key', currentSig.apiKey);
      form.append('signature', currentSig.signature);
      form.append('folder', currentSig.folder);

      const detectionParam = currentSig.detection || (options?.detectFace ? 'adv_face' : null);
      if (detectionParam) {
        form.append('detection', detectionParam);
      }

      const endpointType = options?.isDocument ? 'auto' : 'image';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${currentSig.cloudName}/${endpointType}/upload`;

      // Step 3: Perform upload with progress callback
      const data = await uploadWithXHRProgress(uploadUrl, form, {
        timeoutMs: options?.isDocument ? 60_000 : 45_000,
        onProgress: (pct) => {
          // Map 0-100 XHR progress into 20%-100% total range
          const mapped = Math.min(99, Math.round(20 + pct * 0.79));
          options?.onProgress?.(mapped);
        },
      });

      // Step 4: Optional face detection check for ID documents
      if (options?.detectFace) {
        const info = data.info as { detection?: { adv_face?: { data?: unknown[] } } } | undefined;
        const faces = info?.detection?.adv_face?.data;
        if (!faces || faces.length === 0) {
          throw new Error('Aucun visage détecté sur la photo. Assurez-vous que votre visage est bien éclairé et dégagé.');
        }
      }

      // Format Cloudinary web optimization transformation
      let finalUrl = data.secure_url;
      if (!options?.isDocument && finalUrl.includes('/upload/')) {
        finalUrl = finalUrl.replace('/upload/', '/upload/w_1200,h_900,c_limit,f_auto,q_auto/');
      }

      options?.onProgress?.(100);
      return { url: finalUrl, publicId: data.public_id };
    } catch (err) {
      lastError = err;
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[Upload Resilience] Échec de la tentative ${attempt}/${maxAttempts}:`, errorMessage);

      // If signature expired, force fetch a new signature on next attempt
      if (errorMessage.includes('SIGNATURE_EXPIRED')) {
        currentSig = null;
      }

      if (attempt < maxAttempts) {
        // Exponential backoff with random jitter: 1s, 2.5s, 5s...
        const delayMs = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  const finalMessage = lastError instanceof Error ? lastError.message : 'Échec du téléversement après plusieurs tentatives. Vérifiez votre connexion.';
  throw new Error(finalMessage);
}
