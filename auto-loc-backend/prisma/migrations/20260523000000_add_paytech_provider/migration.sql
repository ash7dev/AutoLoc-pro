-- AlterEnum: Add PAYTECH value to FournisseurPaiement
-- PostgreSQL requires creating a new type and migrating, or using ALTER TYPE ADD VALUE.
-- ADD VALUE is idempotent-safe with IF NOT EXISTS (PostgreSQL 9.6+).

ALTER TYPE "FournisseurPaiement" ADD VALUE IF NOT EXISTS 'PAYTECH';
