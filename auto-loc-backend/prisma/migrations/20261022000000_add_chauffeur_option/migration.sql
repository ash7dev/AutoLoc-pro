-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN     "chauffeurDisponible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prixChauffeurParJour" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "avecChauffeur" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prixChauffeurParJour" DECIMAL(10,2);
