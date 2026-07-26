-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN IF NOT EXISTS "types" "TypeVehicule"[] NOT NULL DEFAULT ARRAY[]::"TypeVehicule"[];

-- Backfill existing vehicles types array from single type column
UPDATE "Vehicule"
SET "types" = ARRAY["type"]::"TypeVehicule"[]
WHERE array_length("types", 1) IS NULL OR array_length("types", 1) = 0;
