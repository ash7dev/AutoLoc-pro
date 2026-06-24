-- CreateIndex
CREATE INDEX "Paiement_fournisseur_statut_idx" ON "Paiement"("fournisseur", "statut");

-- CreateIndex
CREATE INDEX "Paiement_idTransactionFournisseur_fournisseur_idx" ON "Paiement"("idTransactionFournisseur", "fournisseur");

-- CreateIndex
CREATE INDEX "Paiement_creeLe_statut_idx" ON "Paiement"("creeLe" DESC, "statut");

-- CreateIndex
CREATE INDEX "Vehicule_statut_ville_type_prixParJour_idx" ON "Vehicule"("statut", "ville", "type", "prixParJour");

-- CreateIndex
CREATE INDEX "Vehicule_statut_note_totalAvis_idx" ON "Vehicule"("statut", "note" DESC, "totalAvis" DESC);

-- CreateIndex
CREATE INDEX "Vehicule_isFeatured_featuredUntil_statut_idx" ON "Vehicule"("isFeatured", "featuredUntil", "statut");

-- CreateIndex
CREATE INDEX "Vehicule_ville_statut_note_idx" ON "Vehicule"("ville", "statut", "note" DESC);

-- CreateIndex
CREATE INDEX "Vehicule_archiveLe_statut_idx" ON "Vehicule"("archiveLe", "statut");

-- CreateIndex
CREATE INDEX "Vehicule_statut_ville_creeLe_idx" ON "Vehicule"("statut", "ville", "creeLe" DESC);
