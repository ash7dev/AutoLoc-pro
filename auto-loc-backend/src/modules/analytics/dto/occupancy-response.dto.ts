export class OccupancyAnalyticsResponseDto {
  periode!: {
    startDate: string;
    endDate: string;
  };
  totalVehiculesFlotte!: number;
  totalJoursCalendrier!: number;
  totalJoursFlotteExploitable!: number;
  joursLoues!: number;
  joursDisponiblesEtNonLoues!: number;
  joursBloquesProprietaire!: number;
  joursMaintenanceOuSuspendus!: number;
  tauxOccupationCommercialPourcentage!: number; // %
}
