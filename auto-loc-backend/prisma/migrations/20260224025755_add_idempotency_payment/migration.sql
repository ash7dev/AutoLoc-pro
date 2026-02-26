-- AlterTable
ALTER TABLE "IdempotencyKey" ADD COLUMN     "paymentRef" TEXT,
ADD COLUMN     "paymentUrl" TEXT;
