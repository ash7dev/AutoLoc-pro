-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN     "assurance" TEXT,
ADD COLUMN     "reglesSpecifiques" TEXT,
ADD COLUMN     "zoneConduite" TEXT;

-- CreateTable
CREATE TABLE "TarifTier" (
    "id" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "joursMin" INTEGER NOT NULL,
    "joursMax" INTEGER,
    "prix" DECIMAL(10,2) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TarifTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TarifTier_vehiculeId_idx" ON "TarifTier"("vehiculeId");

-- AddForeignKey
ALTER TABLE "TarifTier" ADD CONSTRAINT "TarifTier_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
