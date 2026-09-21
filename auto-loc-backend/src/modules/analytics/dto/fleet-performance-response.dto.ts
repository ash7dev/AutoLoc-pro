export class VehiclePerformanceItemDto {
  vehiculeId!: string;
  marque!: string;
  modele!: string;
  immatriculation!: string;
  photoUrl!: string | null;
  statut!: string;
  caNet!: number;
  nbReservations!: number;
  nbJoursLoues!: number;
  tauxOccupation!: number; // %
  vues30j!: number;
  clics30j!: number;
  tauxConversion!: number; // clics/vues %
  noteMoyenne!: number;
}

export class FleetPerformanceResponseDto {
  periode!: { startDate: string; endDate: string };
  totalVehicles!: number;
  vehicles!: VehiclePerformanceItemDto[];
}
