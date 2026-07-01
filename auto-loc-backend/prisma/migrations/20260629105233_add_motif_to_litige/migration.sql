/*
  Warnings:

  - Added the required column `motif` to the `Litige` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Ajouter la colonne avec une valeur par défaut pour les lignes existantes
ALTER TABLE "Litige" ADD COLUMN "motif" TEXT NOT NULL DEFAULT 'AUTRE';

-- Retirer la valeur par défaut pour les nouvelles lignes (optionnel - garder DEFAULT 'AUTRE' est recommandé)
-- ALTER TABLE "Litige" ALTER COLUMN "motif" DROP DEFAULT;
