-- Migration : remplacement de PAYTECH par INTOUCH dans FournisseurPaiement
-- PostgreSQL ne supporte pas DROP VALUE sur un enum, on recrée donc le type directement.

-- Étape 1 : migrer les enregistrements PAYTECH existants vers WAVE (temporaire)
UPDATE "Paiement"    SET "fournisseur" = 'WAVE'::"FournisseurPaiement" WHERE "fournisseur" = 'PAYTECH'::"FournisseurPaiement";
UPDATE "WebhookLog"  SET "provider"    = 'WAVE'::"FournisseurPaiement" WHERE "provider"    = 'PAYTECH'::"FournisseurPaiement";

-- Étape 2 : recréer le type sans PAYTECH, avec INTOUCH
--   2a. Renommer l'ancien type
ALTER TYPE "FournisseurPaiement" RENAME TO "FournisseurPaiement_old";

--   2b. Créer le nouveau type propre
CREATE TYPE "FournisseurPaiement" AS ENUM ('WAVE', 'ORANGE_MONEY', 'STRIPE', 'INTOUCH');

--   2c. Migrer les colonnes
ALTER TABLE "Paiement"
    ALTER COLUMN "fournisseur" TYPE "FournisseurPaiement"
    USING "fournisseur"::text::"FournisseurPaiement";

ALTER TABLE "WebhookLog"
    ALTER COLUMN "provider" TYPE "FournisseurPaiement"
    USING "provider"::text::"FournisseurPaiement";

--   2d. Supprimer l'ancien type
DROP TYPE "FournisseurPaiement_old";

-- Étape 3 : maintenant on peut utiliser INTOUCH (migrer de WAVE vers INTOUCH les anciens PAYTECH)
-- NOTE: En production, run manuellement après cette migration:
-- UPDATE "Paiement" SET "fournisseur" = 'INTOUCH' WHERE id IN (SELECT id FROM "Paiement" WHERE "fournisseur" = 'WAVE' AND ... condition pour identifier les anciens PAYTECH)
