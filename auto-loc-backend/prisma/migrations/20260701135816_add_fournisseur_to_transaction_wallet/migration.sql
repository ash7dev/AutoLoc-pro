-- AlterTable
ALTER TABLE "TransactionWallet" ADD COLUMN     "fournisseur" "FournisseurPaiement";

-- CreateIndex
CREATE INDEX "TransactionWallet_walletId_fournisseur_idx" ON "TransactionWallet"("walletId", "fournisseur");
