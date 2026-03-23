-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN     "autoriseHorsDakar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supplementHorsDakarParJour" DECIMAL(10,2);
