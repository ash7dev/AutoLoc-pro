-- Migration : suppression de VIREMENT dans MethodeRetrait
-- Seules les méthodes WAVE et ORANGE_MONEY sont supportées.

-- Étape 1 : migrer les éventuels enregistrements VIREMENT vers WAVE
UPDATE "Retrait" SET "methode" = 'WAVE'::"MethodeRetrait" WHERE "methode" = 'VIREMENT'::"MethodeRetrait";

-- Étape 2 : recréer l'enum sans VIREMENT
ALTER TYPE "MethodeRetrait" RENAME TO "MethodeRetrait_old";
CREATE TYPE "MethodeRetrait" AS ENUM ('WAVE', 'ORANGE_MONEY');
ALTER TABLE "Retrait"
    ALTER COLUMN "methode" TYPE "MethodeRetrait"
    USING "methode"::text::"MethodeRetrait";
DROP TYPE "MethodeRetrait_old";
