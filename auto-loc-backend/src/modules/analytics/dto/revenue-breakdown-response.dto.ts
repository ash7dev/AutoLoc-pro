export class RevenueBreakdownPointDto {
  date!: string; // "YYYY-MM-DD" ou "YYYY-MM"
  caBrut!: number;
  commissionAutoLoc!: number;
  netProprietaire!: number;
  revenusEncaisses!: number;
  nbReservationsActives!: number;
  nbJoursLoues!: number;
}

export class RevenueBreakdownTotalsDto {
  caBrut!: number;
  commissionAutoLoc!: number;
  netProprietaire!: number;
  revenusEncaisses!: number;
  nbReservations!: number;
  nbJoursLoues!: number;
}

export class RevenueBreakdownResponseDto {
  period!: {
    startDate: string;
    endDate: string;
    groupBy: 'day' | 'week' | 'month';
  };
  totals!: RevenueBreakdownTotalsDto;
  timeSeries!: RevenueBreakdownPointDto[];
}
