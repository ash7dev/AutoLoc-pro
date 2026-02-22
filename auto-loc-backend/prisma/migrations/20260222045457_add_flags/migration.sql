-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false;
