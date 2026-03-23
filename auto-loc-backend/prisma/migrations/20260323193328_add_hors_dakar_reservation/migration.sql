-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "horsDakar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supplementHorsDakar" DECIMAL(10,2);
