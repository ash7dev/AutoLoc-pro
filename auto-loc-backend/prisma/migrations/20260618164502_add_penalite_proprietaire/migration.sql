-- CreateTable
CREATE TABLE "PenaliteProprietaire" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "raison" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preleveleLe" TIMESTAMP(3),

    CONSTRAINT "PenaliteProprietaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PenaliteProprietaire_utilisateurId_preleveleLe_idx" ON "PenaliteProprietaire"("utilisateurId", "preleveleLe");

-- CreateIndex
CREATE INDEX "PenaliteProprietaire_utilisateurId_idx" ON "PenaliteProprietaire"("utilisateurId");

-- AddForeignKey
ALTER TABLE "PenaliteProprietaire" ADD CONSTRAINT "PenaliteProprietaire_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenaliteProprietaire" ADD CONSTRAINT "PenaliteProprietaire_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
