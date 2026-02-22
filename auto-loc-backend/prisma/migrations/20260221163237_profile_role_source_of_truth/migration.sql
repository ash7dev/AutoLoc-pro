/*
  Warnings:

  - You are about to drop the column `motDePasse` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Utilisateur` table. All the data in the column will be lost.
  - The `role` column on the `profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleProfile" AS ENUM ('LOCATAIRE', 'PROPRIETAIRE', 'ADMIN', 'SUPPORT');

-- DropIndex
DROP INDEX "Utilisateur_role_idx";

-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "motDePasse",
DROP COLUMN "role",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "role",
ADD COLUMN     "role" "RoleProfile" NOT NULL DEFAULT 'LOCATAIRE';

-- DropEnum
DROP TYPE "RoleUtilisateur";

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_userId_key" ON "Utilisateur"("userId");

-- CreateIndex
CREATE INDEX "Utilisateur_userId_idx" ON "Utilisateur"("userId");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
