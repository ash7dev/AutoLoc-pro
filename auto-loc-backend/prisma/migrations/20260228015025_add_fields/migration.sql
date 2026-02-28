-- CreateEnum
CREATE TYPE "TypeEtatLieu" AS ENUM ('CHECKIN', 'CHECKOUT');

-- CreateEnum
CREATE TYPE "CategoriePhoto" AS ENUM ('AVANT', 'ARRIERE', 'COTE_GAUCHE', 'COTE_DROIT', 'INTERIEUR', 'COMPTEUR_KM', 'CARBURANT', 'AUTRE');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "checkinLocataireLe" TIMESTAMP(3),
ADD COLUMN     "checkinProprietaireLe" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PhotoEtatLieu" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "type" "TypeEtatLieu" NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "categorie" "CategoriePhoto",
    "position" INTEGER NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoEtatLieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndisponibiliteVehicule" (
    "id" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "dateDebut" DATE NOT NULL,
    "dateFin" DATE NOT NULL,
    "motif" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndisponibiliteVehicule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhotoEtatLieu_reservationId_type_idx" ON "PhotoEtatLieu"("reservationId", "type");

-- CreateIndex
CREATE INDEX "IndisponibiliteVehicule_vehiculeId_dateDebut_dateFin_idx" ON "IndisponibiliteVehicule"("vehiculeId", "dateDebut", "dateFin");

-- AddForeignKey
ALTER TABLE "PhotoEtatLieu" ADD CONSTRAINT "PhotoEtatLieu_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndisponibiliteVehicule" ADD CONSTRAINT "IndisponibiliteVehicule_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
