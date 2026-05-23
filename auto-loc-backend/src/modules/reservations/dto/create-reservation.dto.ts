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

  /** Clé d'idempotence côté body (alternative au header Idempotency-Key). */
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  /** Méthode de paiement cible pour PayTech (ex: 'Wave', 'Orange Money', 'Free Money'). */
  @IsOptional()
  @IsString()
  targetPayment?: string;

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
