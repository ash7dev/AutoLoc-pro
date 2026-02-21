-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('LOCATAIRE', 'PROPRIETAIRE', 'ADMIN', 'SUPPORT');

-- CreateEnum
CREATE TYPE "StatutKyc" AS ENUM ('NON_VERIFIE', 'EN_ATTENTE', 'VERIFIE', 'REJETE');

-- CreateEnum
CREATE TYPE "TypeVehicule" AS ENUM ('BERLINE', 'SUV', 'PICKUP', 'MINIVAN', 'UTILITAIRE');

-- CreateEnum
CREATE TYPE "StatutVehicule" AS ENUM ('EN_ATTENTE_VALIDATION', 'VERIFIE', 'SUSPENDU', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "Carburant" AS ENUM ('ESSENCE', 'DIESEL', 'HYBRIDE', 'ELECTRIQUE');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUELLE', 'AUTOMATIQUE');

-- CreateEnum
CREATE TYPE "StatutReservation" AS ENUM ('INITIEE', 'EN_ATTENTE_PAIEMENT', 'PAYEE', 'CONFIRMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE', 'LITIGE');

-- CreateEnum
CREATE TYPE "Devise" AS ENUM ('XOF', 'EUR', 'USD');

-- CreateEnum
CREATE TYPE "FournisseurPaiement" AS ENUM ('WAVE', 'ORANGE_MONEY', 'STRIPE');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'CONFIRME', 'ECHOUE', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "TypeTransactionWallet" AS ENUM ('CREDIT_LOCATION', 'DEBIT_PENALITE', 'DEBIT_RETRAIT');

-- CreateEnum
CREATE TYPE "SensTransaction" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "MethodeRetrait" AS ENUM ('WAVE', 'ORANGE_MONEY', 'VIREMENT');

-- CreateEnum
CREATE TYPE "StatutRetrait" AS ENUM ('EN_ATTENTE', 'VALIDE', 'EFFECTUE', 'REJETE');

-- CreateEnum
CREATE TYPE "StatutLitige" AS ENUM ('EN_ATTENTE', 'FONDE', 'NON_FONDE');

-- CreateEnum
CREATE TYPE "TypeAvis" AS ENUM ('LOCATAIRE_NOTE_PROPRIO', 'PROPRIO_NOTE_LOCATAIRE');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "motDePasse" TEXT,
    "role" "RoleUtilisateur" NOT NULL DEFAULT 'LOCATAIRE',
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "statutKyc" "StatutKyc" NOT NULL DEFAULT 'NON_VERIFIE',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "bloqueJusqua" TIMESTAMP(3),
    "noteLocataire" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "noteProprietaire" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalAvis" INTEGER NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "id" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "type" "TypeVehicule" NOT NULL,
    "carburant" "Carburant",
    "transmission" "Transmission",
    "nombrePlaces" INTEGER,
    "immatriculation" TEXT NOT NULL,
    "prixParJour" DECIMAL(10,2) NOT NULL,
    "ville" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "joursMinimum" INTEGER NOT NULL DEFAULT 1,
    "ageMinimum" INTEGER NOT NULL DEFAULT 18,
    "statut" "StatutVehicule" NOT NULL DEFAULT 'EN_ATTENTE_VALIDATION',
    "note" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalAvis" INTEGER NOT NULL DEFAULT 0,
    "totalLocations" INTEGER NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Equipement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiculeEquipement" (
    "vehiculeId" TEXT NOT NULL,
    "equipementId" TEXT NOT NULL,

    CONSTRAINT "VehiculeEquipement_pkey" PRIMARY KEY ("vehiculeId","equipementId")
);

-- CreateTable
CREATE TABLE "PhotoVehicule" (
    "id" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "estPrincipale" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoVehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "dateDebut" DATE NOT NULL,
    "dateFin" DATE NOT NULL,
    "prixParJour" DECIMAL(10,2) NOT NULL,
    "totalBase" DECIMAL(10,2) NOT NULL,
    "tauxCommission" DECIMAL(5,4) NOT NULL,
    "montantCommission" DECIMAL(10,2) NOT NULL,
    "totalLocataire" DECIMAL(10,2) NOT NULL,
    "netProprietaire" DECIMAL(10,2) NOT NULL,
    "statut" "StatutReservation" NOT NULL DEFAULT 'EN_ATTENTE_PAIEMENT',
    "paymentUrl" TEXT,
    "delaiSignature" TIMESTAMP(3) NOT NULL,
    "annuleParId" TEXT,
    "annuleLe" TIMESTAMP(3),
    "raisonAnnulation" TEXT,
    "confirmeeLe" TIMESTAMP(3),
    "checkinLe" TIMESTAMP(3),
    "checkoutLe" TIMESTAMP(3),
    "closeLe" TIMESTAMP(3),
    "updatedBySystem" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationHistorique" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "ancienStatut" "StatutReservation",
    "nouveauStatut" "StatutReservation" NOT NULL,
    "modifiePar" TEXT,
    "modifieLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationHistorique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "devise" "Devise" NOT NULL DEFAULT 'XOF',
    "fournisseur" "FournisseurPaiement" NOT NULL,
    "idTransactionFournisseur" TEXT,
    "statut" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rembourseLe" TIMESTAMP(3),
    "montantRembourse" DECIMAL(10,2),

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "soldeDisponible" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionWallet" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "reservationId" TEXT,
    "type" "TypeTransactionWallet" NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "sens" "SensTransaction" NOT NULL,
    "soldeApres" DECIMAL(10,2) NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retrait" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "methode" "MethodeRetrait" NOT NULL,
    "destinataire" TEXT NOT NULL,
    "statut" "StatutRetrait" NOT NULL DEFAULT 'EN_ATTENTE',
    "raisonRejet" TEXT,
    "demandeeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traiteLe" TIMESTAMP(3),

    CONSTRAINT "Retrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Litige" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coutEstime" DECIMAL(10,2),
    "statut" "StatutLitige" NOT NULL DEFAULT 'EN_ATTENTE',
    "montantCompensation" DECIMAL(10,2),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resoluLe" TIMESTAMP(3),

    CONSTRAINT "Litige_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avis" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "cibleId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "typeAvis" "TypeAvis" NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "provider" "FournisseurPaiement" NOT NULL,
    "payloadRaw" TEXT NOT NULL,
    "signatureReceived" TEXT NOT NULL,
    "signatureCalculated" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL,
    "statusCode" INTEGER,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "idTransactionFournisseur" TEXT,
    "reservationId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_telephone_key" ON "Utilisateur"("telephone");

-- CreateIndex
CREATE INDEX "Utilisateur_role_idx" ON "Utilisateur"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_immatriculation_key" ON "Vehicule"("immatriculation");

-- CreateIndex
CREATE INDEX "Vehicule_proprietaireId_idx" ON "Vehicule"("proprietaireId");

-- CreateIndex
CREATE INDEX "Vehicule_statut_idx" ON "Vehicule"("statut");

-- CreateIndex
CREATE INDEX "Vehicule_ville_idx" ON "Vehicule"("ville");

-- CreateIndex
CREATE INDEX "Vehicule_statut_ville_prixParJour_idx" ON "Vehicule"("statut", "ville", "prixParJour");

-- CreateIndex
CREATE INDEX "Vehicule_ville_type_idx" ON "Vehicule"("ville", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Equipement_nom_key" ON "Equipement"("nom");

-- CreateIndex
CREATE INDEX "PhotoVehicule_vehiculeId_idx" ON "PhotoVehicule"("vehiculeId");

-- CreateIndex
CREATE INDEX "PhotoVehicule_vehiculeId_estPrincipale_idx" ON "PhotoVehicule"("vehiculeId", "estPrincipale");

-- CreateIndex
CREATE INDEX "Reservation_vehiculeId_statut_idx" ON "Reservation"("vehiculeId", "statut");

-- CreateIndex
CREATE INDEX "Reservation_vehiculeId_statut_dateDebut_dateFin_idx" ON "Reservation"("vehiculeId", "statut", "dateDebut", "dateFin");

-- CreateIndex
CREATE INDEX "Reservation_locataireId_idx" ON "Reservation"("locataireId");

-- CreateIndex
CREATE INDEX "Reservation_proprietaireId_idx" ON "Reservation"("proprietaireId");

-- CreateIndex
CREATE INDEX "Reservation_proprietaireId_statut_idx" ON "Reservation"("proprietaireId", "statut");

-- CreateIndex
CREATE INDEX "Reservation_statut_idx" ON "Reservation"("statut");

-- CreateIndex
CREATE INDEX "Reservation_delaiSignature_statut_idx" ON "Reservation"("delaiSignature", "statut");

-- CreateIndex
CREATE INDEX "ReservationHistorique_reservationId_idx" ON "ReservationHistorique"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_reservationId_key" ON "Paiement"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_idTransactionFournisseur_key" ON "Paiement"("idTransactionFournisseur");

-- CreateIndex
CREATE INDEX "Paiement_statut_idx" ON "Paiement"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_utilisateurId_key" ON "Wallet"("utilisateurId");

-- CreateIndex
CREATE INDEX "Wallet_utilisateurId_idx" ON "Wallet"("utilisateurId");

-- CreateIndex
CREATE INDEX "TransactionWallet_walletId_idx" ON "TransactionWallet"("walletId");

-- CreateIndex
CREATE INDEX "TransactionWallet_walletId_creeLe_idx" ON "TransactionWallet"("walletId", "creeLe" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionWallet_reservationId_type_key" ON "TransactionWallet"("reservationId", "type");

-- CreateIndex
CREATE INDEX "Retrait_statut_idx" ON "Retrait"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "Litige_reservationId_key" ON "Litige"("reservationId");

-- CreateIndex
CREATE INDEX "Litige_statut_idx" ON "Litige"("statut");

-- CreateIndex
CREATE INDEX "Avis_cibleId_idx" ON "Avis"("cibleId");

-- CreateIndex
CREATE UNIQUE INDEX "Avis_reservationId_auteurId_key" ON "Avis"("reservationId", "auteurId");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_reservationId_key" ON "IdempotencyKey"("reservationId");

-- CreateIndex
CREATE INDEX "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey"("expiresAt");

-- CreateIndex
CREATE INDEX "WebhookLog_provider_creeLe_idx" ON "WebhookLog"("provider", "creeLe");

-- CreateIndex
CREATE INDEX "WebhookLog_idTransactionFournisseur_idx" ON "WebhookLog"("idTransactionFournisseur");

-- CreateIndex
CREATE INDEX "WebhookLog_reservationId_idx" ON "WebhookLog"("reservationId");

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiculeEquipement" ADD CONSTRAINT "VehiculeEquipement_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiculeEquipement" ADD CONSTRAINT "VehiculeEquipement_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoVehicule" ADD CONSTRAINT "PhotoVehicule_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationHistorique" ADD CONSTRAINT "ReservationHistorique_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionWallet" ADD CONSTRAINT "TransactionWallet_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retrait" ADD CONSTRAINT "Retrait_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Litige" ADD CONSTRAINT "Litige_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_cibleId_fkey" FOREIGN KEY ("cibleId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyKey" ADD CONSTRAINT "IdempotencyKey_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
