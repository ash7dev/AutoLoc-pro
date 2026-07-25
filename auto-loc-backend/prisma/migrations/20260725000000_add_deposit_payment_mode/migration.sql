-- CreateEnum
CREATE TYPE "ModePaiementReservation" AS ENUM ('TOTAL_EN_LIGNE', 'ACOMPTE_SOLDE_CHECKIN');

-- AlterTable
ALTER TABLE "Reservation"
ADD COLUMN "modePaiement" "ModePaiementReservation" NOT NULL DEFAULT 'TOTAL_EN_LIGNE',
ADD COLUMN "tauxAcompte" DECIMAL(5,4),
ADD COLUMN "montantPayeEnLigne" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "montantSoldeCheckin" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "montantCommissionEnLigne" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "montantProprietaireEnLigne" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "soldeConfirmeLe" TIMESTAMP(3),
ADD COLUMN "soldeConfirmeParId" TEXT;

-- Backfill existing reservations as fully paid online semantics.
UPDATE "Reservation"
SET
  "modePaiement" = 'TOTAL_EN_LIGNE',
  "montantPayeEnLigne" = "totalLocataire",
  "montantSoldeCheckin" = 0,
  "montantCommissionEnLigne" = "montantCommission",
  "montantProprietaireEnLigne" = "netProprietaire"
WHERE "montantPayeEnLigne" = 0;
