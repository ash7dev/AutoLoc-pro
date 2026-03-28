-- CreateEnum
CREATE TYPE "CheckinLocataireSource" AS ENUM ('USER', 'SYSTEM_TACIT');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "tacitCheckinDeadlineLe" TIMESTAMP(3),
ADD COLUMN     "checkinLocataireSource" "CheckinLocataireSource";

-- CreateIndex
CREATE INDEX "Reservation_statut_tacitCheckinDeadlineLe_idx" ON "Reservation"("statut", "tacitCheckinDeadlineLe");
