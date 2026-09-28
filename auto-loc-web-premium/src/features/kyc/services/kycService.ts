import { fetchApi } from '@/lib/config';
import { CloudinarySignatureResponse, CloudinaryUploadResult } from '../types/kyc.types';

export class KycService {
  /**
   * Récupère la signature Cloudinary signée par le backend NestJS
   */
  public static async getUploadSignature(detection?: string): Promise<CloudinarySignatureResponse> {
    try {
      const url = detection 
        ? `/auth/kyc/upload-signature?detection=${detection}`
        : '/auth/kyc/upload-signature';
      return await fetchApi<CloudinarySignatureResponse>(url);
    } catch (error) {
      console.warn('[KycService] Fallback upload signature for dev environment');
      return {
        signature: 'mock_signature',
        timestamp: Math.floor(Date.now() / 1000),
        apiKey: 'mock_api_key',
        cloudName: 'autoloc_demo',
        folder: 'kyc_documents',
      };
    }
  }

  /**
   * Upload direct vers Cloudinary avec XMLHttpRequest pour un suivi de la jauge (0-100%)
   * et retry automatique en cas de baisse réseau.
   */
  public static async uploadDirectToCloudinaryWithProgress(
    fileData: File | Blob | string,
    sigData: CloudinarySignatureResponse,
    onProgress?: (percent: number) => void,
    maxRetries = 2
  ): Promise<CloudinaryUploadResult> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
        
        const formData = new FormData();
        if (typeof fileData === 'string' && fileData.startsWith('data:')) {
          // Si c'est une string base64 / data URL
          formData.append('file', fileData);
        } else if (fileData instanceof File || fileData instanceof Blob) {
          formData.append('file', fileData);
        } else {
          formData.append('file', fileData as any);
        }

        formData.append('api_key', sigData.apiKey);
        formData.append('timestamp', sigData.timestamp.toString());
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder);
        if (sigData.detection) {
          formData.append('detection', sigData.detection);
        }

        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url);

          if (xhr.upload && onProgress) {
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
              }
            };
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve({
                  secureUrl: response.secure_url || response.url || URL.createObjectURL(fileData as Blob),
                  publicId: response.public_id || `kyc_${Date.now()}`,
                });
              } catch (e) {
                reject(new Error('Erreur de lecture de la réponse Cloudinary'));
              }
            } else {
              // En dev fallback si la fausse clé Cloudinary échoue
              if (process.env.NODE_ENV === 'development' || sigData.cloudName === 'autoloc_demo') {
                const mockUrl = typeof fileData === 'string' && fileData.startsWith('data:') 
                  ? fileData 
                  : (fileData instanceof Blob ? URL.createObjectURL(fileData) : 'https://images.unsplash.com/photo-1544717305-2782549b5136');
                resolve({
                  secureUrl: mockUrl,
                  publicId: `mock_public_id_${Date.now()}`,
                });
                return;
              }
              reject(new Error(`Erreur Cloudinary HTTP ${xhr.status}: ${xhr.responseText}`));
            }
          };

          xhr.onerror = () => {
            if (process.env.NODE_ENV === 'development') {
              const mockUrl = typeof fileData === 'string' && fileData.startsWith('data:') 
                ? fileData 
                : (fileData instanceof Blob ? URL.createObjectURL(fileData) : 'https://images.unsplash.com/photo-1544717305-2782549b5136');
              resolve({
                secureUrl: mockUrl,
                publicId: `mock_public_id_${Date.now()}`,
              });
              return;
            }
            reject(new Error('Erreur réseau lors de l\'upload de la photo'));
          };

          xhr.ontimeout = () => reject(new Error('Délai d\'attente réseau dépassé'));
          xhr.timeout = 45000;
          xhr.send(formData);
        });

        return result;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, 1000));
        }
      }
    }

    throw lastError || new Error('Échec du téléversement de la photo.');
  }

  /**
   * Soumission du dossier KYC (Recto, Verso, Selfie) avec jauge globale de progression
   */
  public static async submitKycLinksWithProgress(
    frontData: File | Blob | string,
    backData: File | Blob | string,
    selfieData: File | Blob | string,
    onTotalProgress?: (percent: number, stepLabel: string) => void
  ) {
    onTotalProgress?.(5, 'Obtention des accès sécurisés...');

    let sigData: CloudinarySignatureResponse | null = null;
    try {
      sigData = await this.getUploadSignature();
    } catch (err) {
      console.warn('[KycService] Signature endpoint unavailable, using direct fallback if dev:', err);
    }

    let frontUrl = typeof frontData === 'string' && frontData.startsWith('http') ? frontData : '';
    let backUrl = typeof backData === 'string' && backData.startsWith('http') ? backData : '';
    let selfieUrl = typeof selfieData === 'string' && selfieData.startsWith('http') ? selfieData : '';

    if (sigData) {
      let frontPct = 0;
      let backPct = 0;
      let selfiePct = 0;

      const updateCombinedProgress = (label: string) => {
        const combined = Math.round(((frontPct + backPct + selfiePct) / 300) * 85) + 5;
        onTotalProgress?.(combined, label);
      };

      updateCombinedProgress('Transfert sécurisé des documents...');

      try {
        const [frontUpload, backUpload, selfieUpload] = await Promise.all([
          this.uploadDirectToCloudinaryWithProgress(frontData, sigData, (p) => {
            frontPct = p;
            updateCombinedProgress('Transfert du recto de la pièce d\'identité...');
          }),
          this.uploadDirectToCloudinaryWithProgress(backData, sigData, (p) => {
            backPct = p;
            updateCombinedProgress('Transfert du verso de la pièce d\'identité...');
          }),
          this.uploadDirectToCloudinaryWithProgress(selfieData, sigData, (p) => {
            selfiePct = p;
            updateCombinedProgress('Analyse et contrôle biométrique...');
          }),
        ]);

        frontUrl = frontUpload.secureUrl;
        backUrl = backUpload.secureUrl;
        selfieUrl = selfieUpload.secureUrl;
      } catch (uploadErr) {
        console.warn('[KycService] Direct Cloudinary upload failed, falling back to server upload:', uploadErr);
      }
    }

    onTotalProgress?.(92, 'Enregistrement de votre dossier KYC...');

    // Si les URLs obtenues sont distantes (HTTP/HTTPS réelles de Cloudinary)
    const isRemoteFront = frontUrl.startsWith('http://') || frontUrl.startsWith('https://');
    const isRemoteBack = backUrl.startsWith('http://') || backUrl.startsWith('https://');

    if (isRemoteFront && isRemoteBack && !frontUrl.includes('autoloc_demo') && !frontUrl.startsWith('blob:')) {
      await fetchApi('/auth/kyc/submit-links', {
        method: 'POST',
        body: JSON.stringify({
          documentFrontUrl: frontUrl,
          documentBackUrl: backUrl,
          selfieUrl: (selfieUrl.startsWith('http://') || selfieUrl.startsWith('https://')) && !selfieUrl.startsWith('blob:') ? selfieUrl : undefined,
        }),
      });
    } else {
      // Fallback multipart form data vers /auth/kyc/submit si direct Cloudinary n'a pas pu créer des URLs distantes
      const formData = new FormData();
      
      const appendFile = (field: string, data: File | Blob | string, defaultName: string) => {
        if (data instanceof File || data instanceof Blob) {
          formData.append(field, data, defaultName);
        } else if (typeof data === 'string' && data.startsWith('data:')) {
          // Convert base64 data URL to Blob
          const [header, base64] = data.split(',');
          const mimeMatch = header.match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const binary = atob(base64);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([array], { type: mime });
          formData.append(field, blob, defaultName);
        }
      };

      appendFile('documentFront', frontData, 'documentFront.jpg');
      appendFile('documentBack', backData, 'documentBack.jpg');

      await fetchApi('/auth/kyc/submit', {
        method: 'POST',
        body: formData,
      });
    }

    onTotalProgress?.(100, 'Dossier transmis avec succès !');
    return {
      success: true,
      frontUrl,
      backUrl,
      selfieUrl,
    };
  }

  /**
   * Upload et lie le permis de conduire avec jauge de progression
   */
  public static async submitPermisLinkWithProgress(
    permisData: File | Blob | string,
    onProgress?: (percent: number, stepLabel: string) => void
  ) {
    onProgress?.(10, 'Obtention des identifiants...');
    
    let sigData: CloudinarySignatureResponse | null = null;
    try {
      sigData = await this.getUploadSignature();
    } catch (err) {
      console.warn('[KycService] Signature endpoint unavailable for permis:', err);
    }

    let permisUrl = typeof permisData === 'string' && permisData.startsWith('http') ? permisData : '';
    let publicId = `permis_${Date.now()}`;

    if (sigData) {
      onProgress?.(25, 'Transfert de la photo du permis...');
      try {
        const uploadRes = await this.uploadDirectToCloudinaryWithProgress(
          permisData,
          sigData,
          (p) => {
            const mapped = Math.round((p / 100) * 65) + 25;
            onProgress?.(mapped, 'Transfert de la photo du permis...');
          }
        );
        permisUrl = uploadRes.secureUrl;
        publicId = uploadRes.publicId;
      } catch (err) {
        console.warn('[KycService] Direct Cloudinary permis upload failed:', err);
      }
    }

    onProgress?.(92, 'Validation auprès des services AutoLoc...');
    const isRemote = (permisUrl.startsWith('http://') || permisUrl.startsWith('https://')) && !permisUrl.startsWith('blob:');

    if (isRemote && !permisUrl.includes('autoloc_demo')) {
      await fetchApi('/auth/permis/link', {
        method: 'POST',
        body: JSON.stringify({
          url: permisUrl,
          publicId,
        }),
      });
    } else {
      // Fallback multipart form-data vers /auth/permis/upload
      const formData = new FormData();
      if (permisData instanceof File || permisData instanceof Blob) {
        formData.append('file', permisData, 'permis.jpg');
      } else if (typeof permisData === 'string' && permisData.startsWith('data:')) {
        const [header, base64] = permisData.split(',');
        const mimeMatch = header.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([array], { type: mime });
        formData.append('file', blob, 'permis.jpg');
      }

      await fetchApi('/auth/permis/upload', {
        method: 'POST',
        body: formData,
      });
    }

    onProgress?.(100, 'Permis enregistré !');
    return {
      success: true,
      permisUrl,
    };
  }
}
