-- Les frais de livraison reviennent au propriétaire (AutoLoc ne perçoit que sa commission).
-- Rattrapage des réservations pas encore versées au propriétaire.
-- Condition "netProprietaire" = "totalBase" : ne s'applique qu'aux réservations créées avec
-- l'ancienne règle (livraison exclue), donc migration idempotente.

-- Paiement 100% en ligne : la part propriétaire en ligne = netProprietaire
UPDATE "Reservation"
SET "netProprietaire" = "netProprietaire" + "fraisLivraison",
    "montantProprietaireEnLigne" = "netProprietaire" + "fraisLivraison"
WHERE "fraisLivraison" > 0
  AND "walletCredite" = false
  AND "netProprietaire" = "totalBase"
  AND "modePaiement" = 'TOTAL_EN_LIGNE'
  AND "statut" IN ('INITIEE', 'EN_ATTENTE_PAIEMENT', 'PAYEE', 'CONFIRMEE', 'EN_COURS');

-- Acompte : la part propriétaire en ligne reste plafonnée par l'acompte encaissé
UPDATE "Reservation"
SET "netProprietaire" = "netProprietaire" + "fraisLivraison",
    "montantProprietaireEnLigne" = LEAST(
      "netProprietaire" + "fraisLivraison",
      GREATEST(0, "montantPayeEnLigne" - "montantCommissionEnLigne")
    )
WHERE "fraisLivraison" > 0
  AND "walletCredite" = false
  AND "netProprietaire" = "totalBase"
  AND "modePaiement" = 'ACOMPTE_SOLDE_CHECKIN'
  AND "statut" IN ('INITIEE', 'EN_ATTENTE_PAIEMENT', 'PAYEE', 'CONFIRMEE', 'EN_COURS');
