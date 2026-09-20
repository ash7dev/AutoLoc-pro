export type KycStatus = 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';

export type GateStep = 
  | 'PREGATE' 
  | 'PROFILE' 
  | 'PHONE' 
  | 'KYC' 
  | 'PERMIS' 
  | 'AGE_INSUFFICIENT';

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

export interface KycSubmissionPayload {
  documentFrontUrl: string;
  documentBackUrl: string;
  selfieUrl: string;
}

export interface PermisSubmissionPayload {
  url: string;
  publicId?: string;
}
