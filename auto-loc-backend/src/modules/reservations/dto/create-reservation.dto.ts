import {
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

  // ── Livraison (optionnel) ──────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  adresseLivraison?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fraisLivraison?: number;
}
