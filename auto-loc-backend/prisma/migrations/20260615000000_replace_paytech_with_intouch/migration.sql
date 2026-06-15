-- Migration : remplacement de PAYTECH par INTOUCH dans FournisseurPaiement
-- PostgreSQL ne supporte pas DROP VALUE sur un enum, on recrée donc le type.

-- Étape 1 : ajouter INTOUCH (idempotent)
ALTER TYPE "FournisseurPaiement" ADD VALUE IF NOT EXISTS 'INTOUCH';

-- Étape 2 : migrer les enregistrements PAYTECH existants vers INTOUCH
UPDATE "Paiement"    SET "fournisseur" = 'INTOUCH'::"FournisseurPaiement" WHERE "fournisseur" = 'PAYTECH'::"FournisseurPaiement";
UPDATE "WebhookLog"  SET "provider"    = 'INTOUCH'::"FournisseurPaiement" WHERE "provider"    = 'PAYTECH'::"FournisseurPaiement";

-- Étape 3 : recréer le type sans PAYTECH
--   3a. Renommer l'ancien type
ALTER TYPE "FournisseurPaiement" RENAME TO "FournisseurPaiement_old";

--   3b. Créer le nouveau type propre
CREATE TYPE "FournisseurPaiement" AS ENUM ('WAVE', 'ORANGE_MONEY', 'STRIPE', 'INTOUCH');

--   3c. Migrer les colonnes
ALTER TABLE "Paiement"
    ALTER COLUMN "fournisseur" TYPE "FournisseurPaiement"
    USING "fournisseur"::text::"FournisseurPaiement";

ALTER TABLE "WebhookLog"
    ALTER COLUMN "provider" TYPE "FournisseurPaiement"
    USING "provider"::text::"FournisseurPaiement";

--   3d. Supprimer l'ancien type
DROP TYPE "FournisseurPaiement_old";
