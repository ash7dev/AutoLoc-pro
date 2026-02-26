-- AlterTable: add KYC document URL fields and rejection reason to Utilisateur
ALTER TABLE "Utilisateur"
  ADD COLUMN "kycDocumentUrl"     TEXT,
  ADD COLUMN "kycSelfieUrl"       TEXT,
  ADD COLUMN "kycRejectionReason" TEXT;
