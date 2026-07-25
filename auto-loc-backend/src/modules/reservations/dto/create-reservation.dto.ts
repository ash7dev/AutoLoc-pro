import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FournisseurPaiement } from '@prisma/client';

export enum ModePaiementReservationDto {
  TOTAL_EN_LIGNE = 'TOTAL_EN_LIGNE',
  ACOMPTE_SOLDE_CHECKIN = 'ACOMPTE_SOLDE_CHECKIN',
}

export class CreateReservationDto {
  @IsUUID()
  vehiculeId!: string;

  @IsDateString()
  @IsNotEmpty()
  dateDebut!: string;

  @IsDateString()
  @IsNotEmpty()
  dateFin!: string;

  @IsEnum(FournisseurPaiement)
  fournisseur!: FournisseurPaiement;

  @IsOptional()
  @IsEnum(ModePaiementReservationDto)
  modePaiement?: ModePaiementReservationDto;

  /** Clé d'idempotence côté body (alternative au header Idempotency-Key). */
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  /** Méthode de paiement cible (ex: 'WAVE', 'ORANGE_MONEY', 'FREE_MONEY'). */
  @IsOptional()
  @IsString()
  targetPayment?: string;

  /** Numéro de téléphone du payeur (requis pour InTouch API directe). */
  @IsOptional()
  @IsString()
  payerPhone?: string;

  // ── Livraison (optionnel) ──────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  adresseLivraison?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fraisLivraison?: number;

  // ── Hors Dakar (optionnel) ─────────────────────────────────────────────────

  @IsOptional()
  @IsBoolean()
  horsDakar?: boolean;
}
