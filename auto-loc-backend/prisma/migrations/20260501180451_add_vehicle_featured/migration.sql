-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN     "featuredUntil" TIMESTAMP(3),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Vehicule_isFeatured_idx" ON "Vehicule"("isFeatured");
