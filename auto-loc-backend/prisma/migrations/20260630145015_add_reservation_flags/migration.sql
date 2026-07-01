-- AlterTable
ALTER TABLE "Litige" ALTER COLUMN "motif" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "absenceSignalee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "occupantsSignales" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "walletCredite" BOOLEAN NOT NULL DEFAULT false;
