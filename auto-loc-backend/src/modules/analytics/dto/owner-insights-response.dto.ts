export type InsightNiveau = 'DESCRIPTIF' | 'DIAGNOSTIQUE';
export type InsightCategory = 'PERFORMANCE' | 'TARIFICATION' | 'QUALITE_ANNONCE' | 'OPERATIONNEL';

export class OwnerInsightItemDto {
  id!: string;
  niveau!: InsightNiveau;
  category!: InsightCategory;
  titre!: string;
  message!: string;
  vehiculeId?: string;
  vehiculeName?: string;
  actionCode?: 'UPDATE_PRICE' | 'REDUCE_MIN_DAYS' | 'ADD_PHOTOS' | 'CONFIRM_RESERVATION' | 'WITHDRAW_FUNDS';
  metadata?: Record<string, unknown>;
}

export class OwnerInsightsResponseDto {
  generatedAt!: string;
  insights!: OwnerInsightItemDto[];
}
