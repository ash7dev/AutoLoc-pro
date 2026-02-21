-- =============================================================================
-- AutoLoc — Manual migration: database hardening (advanced constraints)
-- File: 2026-setup-hardening.sql
-- =============================================================================
--
-- PURPOSE
-- --------
-- This migration adds database-level constraints and indexes that Prisma cannot
-- express. It enforces critical business rules at the DB layer so that data
-- integrity is guaranteed even if application code or other clients write
-- directly to the database.
--
-- WHY THIS CANNOT BE IMPLEMENTED IN PRISMA
-- ----------------------------------------
-- Prisma does not support:
--   • GIST exclusion constraints (e.g. "no overlapping date ranges per vehicle")
--   • Arbitrary CHECK constraints (e.g. dateDebut < dateFin, note in 0–5)
--   • Partial indexes (indexes with WHERE clauses for hot subsets of data)
--   • Extension-dependent objects (e.g. btree_gist)
-- This file is the single place for such definitions and must be kept in sync
-- with schema.prisma conceptually (same tables/columns).
--
-- CONCEPTS USED IN THIS FILE
-- --------------------------
-- • GIST exclusion constraint
--   Prevents two rows from satisfying a condition simultaneously. Here we use it
--   to forbid overlapping reservation date ranges for the same vehicle, except
--   when the reservation is cancelled (statut = 'ANNULEE'). Implemented via
--   the btree_gist extension (daterange + equality on vehiculeId).
--
-- • CHECK constraints
--   Boolean expressions that every row must satisfy. They block invalid data
--   at insert/update time (e.g. dateFin >= dateDebut, notes between 0 and 5,
--   non-negative amounts). Application validation is not enough: DB checks
--   protect against bugs and direct SQL.
--
-- • Partial indexes
--   Indexes built only on rows matching a WHERE clause. They are smaller and
--   faster for queries that filter by that condition (e.g. "active reservations
--   only", "pending payments only"). Naming: idx_<Table>_<columns>_partial_<hint>.
--
-- • Data integrity strategy
--   We combine: (1) Prisma migrations for schema and standard indexes,
--   (2) this manual file for GIST, CHECKs, and partial indexes, (3) application
--   logic for complex business rules. Run this file AFTER `prisma migrate dev`
--   (or equivalent) so that tables and base indexes already exist.
--
-- ⚠️  WARNING: EXECUTE THIS FILE ONLY AFTER PRISMA MIGRATIONS HAVE BEEN APPLIED.
--     Tables and enums must already exist. Typically: prisma migrate dev (or
--     migrate deploy), then run this script once per environment.
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extension (required for GIST exclusion with daterange + text)
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- -----------------------------------------------------------------------------
-- 2. GIST exclusion: no overlapping reservations per vehicle (excluding cancelled)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE c.conname = 'autoloc_reservation_no_double_booking'
      AND t.relname = 'Reservation'
      AND n.nspname = 'public'
  ) THEN
    ALTER TABLE "Reservation"
    ADD CONSTRAINT autoloc_reservation_no_double_booking
    EXCLUDE USING GIST (
      "vehiculeId" WITH =,
      daterange("dateDebut"::date, "dateFin"::date, '[]') WITH &&
    ) WHERE ("statut" <> 'ANNULEE');
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. CHECK constraints — Reservation
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_Reservation_dates_order' AND t.relname = 'Reservation' AND n.nspname = 'public') THEN
    ALTER TABLE "Reservation" ADD CONSTRAINT autoloc_ck_Reservation_dates_order CHECK ("dateFin" >= "dateDebut");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_Reservation_amounts_non_negative' AND t.relname = 'Reservation' AND n.nspname = 'public') THEN
    ALTER TABLE "Reservation" ADD CONSTRAINT autoloc_ck_Reservation_amounts_non_negative
    CHECK (
      "prixParJour" >= 0 AND "totalBase" >= 0 AND "montantCommission" >= 0
      AND "totalLocataire" >= 0 AND "netProprietaire" >= 0
    );
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. CHECK constraints — Utilisateur (notes 0–5, totalAvis >= 0)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_Utilisateur_notes_range' AND t.relname = 'Utilisateur' AND n.nspname = 'public') THEN
    ALTER TABLE "Utilisateur" ADD CONSTRAINT autoloc_ck_Utilisateur_notes_range
    CHECK ("noteLocataire" >= 0 AND "noteLocataire" <= 5 AND "noteProprietaire" >= 0 AND "noteProprietaire" <= 5);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_Utilisateur_totalAvis_non_negative' AND t.relname = 'Utilisateur' AND n.nspname = 'public') THEN
    ALTER TABLE "Utilisateur" ADD CONSTRAINT autoloc_ck_Utilisateur_totalAvis_non_negative CHECK ("totalAvis" >= 0);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 5. CHECK constraints — Vehicule (note 0–5, amounts/counts non-negative)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_Vehicule_note_range' AND t.relname = 'Vehicule' AND n.nspname = 'public') THEN
    ALTER TABLE "Vehicule" ADD CONSTRAINT autoloc_ck_Vehicule_note_range
    CHECK ("note" >= 0 AND "note" <= 5);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_Vehicule_positive' AND t.relname = 'Vehicule' AND n.nspname = 'public') THEN
    ALTER TABLE "Vehicule" ADD CONSTRAINT autoloc_ck_Vehicule_positive
    CHECK ("prixParJour" >= 0 AND "joursMinimum" >= 1 AND "ageMinimum" >= 0 AND "totalAvis" >= 0 AND "totalLocations" >= 0);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 6. CHECK constraints — Paiement, Wallet, TransactionWallet, Retrait
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_Paiement_montant_positive' AND t.relname = 'Paiement' AND n.nspname = 'public') THEN
    ALTER TABLE "Paiement" ADD CONSTRAINT autoloc_ck_Paiement_montant_positive CHECK ("montant" >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_Wallet_solde_non_negative' AND t.relname = 'Wallet' AND n.nspname = 'public') THEN
    ALTER TABLE "Wallet" ADD CONSTRAINT autoloc_ck_Wallet_solde_non_negative CHECK ("soldeDisponible" >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_TransactionWallet_montant_positive' AND t.relname = 'TransactionWallet' AND n.nspname = 'public') THEN
    ALTER TABLE "TransactionWallet" ADD CONSTRAINT autoloc_ck_TransactionWallet_montant_positive CHECK ("montant" > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_Retrait_montant_positive' AND t.relname = 'Retrait' AND n.nspname = 'public') THEN
    ALTER TABLE "Retrait" ADD CONSTRAINT autoloc_ck_Retrait_montant_positive CHECK ("montant" > 0);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 7. CHECK constraints — Avis (note 0–5)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE c.conname = 'autoloc_ck_Avis_note_range' AND t.relname = 'Avis' AND n.nspname = 'public') THEN
    ALTER TABLE "Avis" ADD CONSTRAINT autoloc_ck_Avis_note_range CHECK ("note" >= 0 AND "note" <= 5);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 8. Partial indexes — Reservation (active non-cancelled)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_Reservation_vehicule_dates_active
ON "Reservation" ("vehiculeId", "dateDebut", "dateFin")
WHERE "statut" <> 'ANNULEE';

CREATE INDEX IF NOT EXISTS idx_Reservation_statut_pending
ON "Reservation" ("statut", "delaiSignature")
WHERE "statut" IN ('EN_ATTENTE_PAIEMENT', 'PAYEE');

-- -----------------------------------------------------------------------------
-- 9. Partial index — Paiement (pending)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_Paiement_statut_pending
ON "Paiement" ("statut", "creeLe")
WHERE "statut" = 'EN_ATTENTE';

-- -----------------------------------------------------------------------------
-- 10. Partial index — Retrait (pending)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_Retrait_statut_pending
ON "Retrait" ("statut", "demandeeLe")
WHERE "statut" = 'EN_ATTENTE';

-- -----------------------------------------------------------------------------
-- 11. Partial index — Litige (open)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_Litige_statut_open
ON "Litige" ("statut")
WHERE "statut" = 'EN_ATTENTE';
