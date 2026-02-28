-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TypeVehicule" ADD VALUE 'CITADINE';
ALTER TYPE "TypeVehicule" ADD VALUE 'MONOSPACE';
ALTER TYPE "TypeVehicule" ADD VALUE 'MINIBUS';
ALTER TYPE "TypeVehicule" ADD VALUE 'LUXE';
ALTER TYPE "TypeVehicule" ADD VALUE 'FOUR_X_FOUR';

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "permisPublicId" TEXT,
ADD COLUMN     "permisUrl" TEXT;

-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN     "assuranceDocPublicId" TEXT,
ADD COLUMN     "assuranceDocUrl" TEXT,
ADD COLUMN     "carteGrisePublicId" TEXT,
ADD COLUMN     "carteGriseUrl" TEXT;
