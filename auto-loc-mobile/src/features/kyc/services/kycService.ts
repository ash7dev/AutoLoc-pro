import { apiClient } from '../../../core/api/apiClient';

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  detection?: string;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

export const kycService = {
  /**
   * Récupère les identifiants signés Cloudinary depuis le backend NestJS.
   */
  async getUploadSignature(detection?: string): Promise<CloudinarySignatureResponse> {
    const url = detection 
      ? `/auth/kyc/upload-signature?detection=${detection}`
      : '/auth/kyc/upload-signature';
    const response = await apiClient.get<CloudinarySignatureResponse>(url);
    return response.data;
  },

  /**
   * Effectue un upload direct vers Cloudinary avec XMLHttpRequest pour un suivi de jauge (0-100%)
   * et retry automatique en cas de coupure réseau transitoire.
   */
  async uploadDirectToCloudinaryWithProgress(
    imageUri: string, 
    sigData: CloudinarySignatureResponse,
    onProgress?: (percent: number) => void,
    maxRetries = 2
  ): Promise<CloudinaryUploadResult> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
        
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `kyc_${Date.now()}.jpg`,
        } as any);
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

          // Suivi de la jauge de progression d'upload en temps réel
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
                  secureUrl: response.secure_url || response.url,
                  publicId: response.public_id || `permis_${Date.now()}`,
                });
              } catch (e) {
                reject(new Error('Erreur de parsing de la réponse Cloudinary'));
              }
            } else {
              reject(new Error(`Erreur Cloudinary HTTP ${xhr.status}: ${xhr.responseText}`));
            }
          };

          xhr.onerror = () => reject(new Error('Erreur réseau lors de l\'upload de la photo'));
          xhr.ontimeout = () => reject(new Error('Délai d\'attente réseau dépassé'));

          xhr.timeout = 45000; // 45 secondes max
          xhr.send(formData);
        });

        return result;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          // Attendre 1s avant de retenter
          await new Promise((res) => setTimeout(res, 1000));
        }
      }
    }

    throw lastError || new Error('Échec de l\'upload de la photo après plusieurs tentatives.');
  },

  /**
   * Valide le dossier KYC auprès de l'API NestJS avec jauge de progression globale.
   */
  async submitKycLinksWithProgress(
    frontUri: string, 
    backUri: string, 
    selfieUri: string,
    onTotalProgress?: (percent: number, stepLabel: string) => void
  ) {
    onTotalProgress?.(5, 'Obtention des accès sécurisés...');
    const sigData = await this.getUploadSignature();

    let frontPct = 0;
    let backPct = 0;
    let selfiePct = 0;

    const updateCombinedProgress = (label: string) => {
      const combined = Math.round(((frontPct + backPct + selfiePct) / 300) * 85) + 5; // 5% à 90%
      onTotalProgress?.(combined, label);
    };

    updateCombinedProgress('Transfert sécurisé des photos...');

    // Upload des 3 fichiers en parallèle avec suivi de jauge
    const [frontUpload, backUpload, selfieUpload] = await Promise.all([
      this.uploadDirectToCloudinaryWithProgress(frontUri, sigData, (p) => {
        frontPct = p;
        updateCombinedProgress('Transfert de la pièce d\'identité (Recto)...');
      }),
      this.uploadDirectToCloudinaryWithProgress(backUri, sigData, (p) => {
        backPct = p;
        updateCombinedProgress('Transfert de la pièce d\'identité (Verso)...');
      }),
      this.uploadDirectToCloudinaryWithProgress(selfieUri, sigData, (p) => {
        selfiePct = p;
        updateCombinedProgress('Analyse du selfie et détection biométrique...');
      }),
    ]);

    onTotalProgress?.(92, 'Finalisation et enregistrement du dossier...');

    // Soumission des liens au backend NestJS
    const response = await apiClient.post('/auth/kyc/submit-links', {
      documentFrontUrl: frontUpload.secureUrl,
      documentBackUrl: backUpload.secureUrl,
      selfieUrl: selfieUpload.secureUrl,
    });

    onTotalProgress?.(100, 'Dossier transmis avec succès !');
    return response.data;
  },

  /**
   * Upload et lie le permis de conduire avec jauge de progression.
   */
  async submitPermisLinkWithProgress(
    permisUri: string,
    onProgress?: (percent: number, stepLabel: string) => void
  ) {
    onProgress?.(10, 'Obtention des accès...');
    const sigData = await this.getUploadSignature();

    onProgress?.(25, 'Transfert de la photo du permis...');
    const uploadRes = await this.uploadDirectToCloudinaryWithProgress(
      permisUri,
      sigData,
      (p) => {
        const mapped = Math.round((p / 100) * 65) + 25; // 25% à 90%
        onProgress?.(mapped, 'Transfert de la photo du permis...');
      }
    );

    onProgress?.(92, 'Validation auprès des services AutoLoc...');
    const response = await apiClient.post('/auth/permis/link', {
      url: uploadRes.secureUrl,
      publicId: uploadRes.publicId,
    });

    onProgress?.(100, 'Permis enregistré !');
    return response.data;
  }
};
