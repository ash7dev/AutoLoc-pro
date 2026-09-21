export class OwnerOverviewAnalyticsDto {
  financials!: {
    caBrutMois: number;
    commissionAutoLocMois: number;
    netProprietaireMois: number;
    revenusEncaissesMois: number;
    revenusEnAttente: number;
    soldeDisponibleWallet: number;
    soldeRetirableWallet: number;
    variationMoisPourcentage: number;
  };
  operational!: {
    reservationsActives: number;
    demandesEnAttenteCount: number;
    checkinsAujourdhuiCount: number;
    checkoutsAujourdhuiCount: number;
    litigesOuvertsCount: number;
  };
  fleet!: {
    totalVehiculesCount: number;
    vehiculesLouesAujourdhuiCount: number;
    tauxOccupationReelMois: number; // %
    noteMoyenneFlotte: number;
  };
}
