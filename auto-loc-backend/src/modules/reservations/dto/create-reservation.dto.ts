import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FournisseurPaiement } from '@prisma/client';

export enum TypeLivraisonEnum {
  AUCUNE = 'AUCUNE',
  DAKAR = 'DAKAR',
  AIBD = 'AIBD',
}

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
  @IsEnum(TypeLivraisonEnum)
  typeLivraison?: TypeLivraisonEnum;

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

  /** Nombre de jours passés hors Dakar (1..nbJours). Défaut : toute la durée. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  nbJoursHorsDakar?: number;

  // ── Chauffeur (optionnel) ──────────────────────────────────────────────────

  @IsOptional()
  @IsBoolean()
  avecChauffeur?: boolean;

  // ── Growth Attribution (optionnel) ─────────────────────────────────────────

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  fbclid?: string;
}
