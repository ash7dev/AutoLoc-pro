-- Add read-optimization indexes for reservation list pages.
-- These indexes do not delete or modify reservation data.

CREATE INDEX "Reservation_locataireId_creeLe_idx" ON "Reservation"("locataireId", "creeLe" DESC);

CREATE INDEX "Reservation_locataireId_statut_creeLe_idx" ON "Reservation"("locataireId", "statut", "creeLe" DESC);

CREATE INDEX "Reservation_proprietaireId_creeLe_idx" ON "Reservation"("proprietaireId", "creeLe" DESC);

CREATE INDEX "Reservation_proprietaireId_statut_creeLe_idx" ON "Reservation"("proprietaireId", "statut", "creeLe" DESC);
